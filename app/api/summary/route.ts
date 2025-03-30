import { z } from "zod";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { getDocumentById, createGeneratedContent, getGeneratedContentByDocumentId } from "@/db/queries";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

// Summary schema definition
const summarySchema = z.object({
  summaryText: z.string(),
  keyPoints: z.array(z.string()),
  title: z.string(),
});

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
        { error: "You must be logged in to generate summaries" },
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
              "You are a helpful study assistant. Your job is to create a comprehensive summary of the provided document, extracting key points and concepts.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Create a detailed summary of this document. Include the main concepts, important details, and key takeaways.",
              },
              {
                type: "file",
                data: fileContent,
                mimeType: "application/pdf",
              },
            ],
          },
        ],
        schema: summarySchema,
        onFinish: async ({ object }) => {
          const res = summarySchema.safeParse(object);
          if (res.error) {
            throw new Error(res.error.errors.map((e) => e.message).join("\n"));
          }
          
          // Save generated content if this was a request from a document
          if (documentId) {
            try {
              // Check if a summary already exists for this document
              const existingContent = await getGeneratedContentByDocumentId({ documentId });
              const existingSummaries = existingContent.filter(item => item.contentType === 'summary');
              
              // Only save if there's no existing summary or save is forced
              if (existingSummaries.length === 0) {
                await createGeneratedContent({
                  contentType: 'summary',
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
        { error: `AI model error: ${error instanceof Error ? error.message : "Failed to generate summary"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
} 