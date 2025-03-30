import { questionSchema, questionsSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { getDocumentById, createGeneratedContent, getGeneratedContentByDocumentId } from "@/db/queries";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

// Set max duration for long-running requests
export const maxDuration = 60;

// Check if the Google API key is available
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!googleApiKey) {
  console.warn("Warning: GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate quizzes" },
        { status: 401 }
      );
    }

    let fileContent = '';
    let fileName = '';
    let documentId = null;
    
    try {
      // First check if the documentId is passed in the request body
      const body = await req.json().catch(() => ({}));
      
      // Get documentId either from body or searchParams
      documentId = body.documentId || new URL(req.url).searchParams.get('documentId');
      
      if (documentId) {
        // Fetching from existing document in blob storage
        const document = await getDocumentById({ id: documentId });
        
        if (!document) {
          return NextResponse.json(
            { error: "Document not found" },
            { status: 404 }
          );
        }
        
        // Check if the document belongs to the current user
        if (document.userId !== session.user.id) {
          return NextResponse.json(
            { error: "You don't have permission to access this document" },
            { status: 403 }
          );
        }
        
        // Fetch the file from Vercel Blob
        const response = await fetch(document.blobUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch document from storage: ${response.statusText}`);
        }
        
        const fileBuffer = await response.arrayBuffer();
        fileContent = `data:${document.fileType};base64,${Buffer.from(fileBuffer).toString('base64')}`;
        fileName = document.fileName;
      } else if (body.files && body.files.length) {
        // Original flow (direct upload)
        fileContent = body.files[0].data;
        fileName = body.files[0].name;
      } else {
        return NextResponse.json(
          { error: "No files provided and no documentId specified" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error processing document:", error);
      return NextResponse.json(
        { error: `Error processing document: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    try {
      // Explicitly use the environment variable
      if (!googleApiKey) {
        throw new Error("Google API key is not configured");
      }

      // Set environment variable explicitly if it's not being picked up automatically
      process.env.GOOGLE_API_KEY = googleApiKey;

      const result = await streamObject({
        model: google("gemini-1.5-pro-latest"),
        messages: [
          {
            role: "system",
            content:
              "You are a teacher. Your job is to take a document, and create a multiple choice test (with 4 questions) based on the content of the document. Each option should be roughly equal in length.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Create a multiple choice test based on this document.",
              },
              {
                type: "file",
                data: fileContent,
                mimeType: "application/pdf",
              },
            ],
          },
        ],
        schema: questionSchema,
        output: "array",
        onFinish: async ({ object }) => {
          const res = questionsSchema.safeParse(object);
          if (res.error) {
            throw new Error(res.error.errors.map((e) => e.message).join("\n"));
          }
          
          // Save generated content if this was a request from a document
          if (documentId) {
            try {
              // Check if a quiz already exists for this document
              const existingContent = await getGeneratedContentByDocumentId({ documentId });
              const existingQuizzes = existingContent.filter(item => item.contentType === 'quiz');
              
              // Only save if there's no existing quiz or save is forced
              if (existingQuizzes.length === 0) {
                await createGeneratedContent({
                  contentType: 'quiz',
                  content: object,
                  documentId,
                });
              }
            } catch (error) {
              console.error("Error saving generated content:", error);
              // Continue even if saving fails
            }
          }
        },
      });

      return new Response(result.textStream);
    } catch (error) {
      console.error("Error in AI model processing:", error);
      return NextResponse.json(
        { error: `AI model error: ${error instanceof Error ? error.message : "Failed to generate quiz"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
} 