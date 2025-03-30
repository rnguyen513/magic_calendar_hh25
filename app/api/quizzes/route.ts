import { questionSchema, questionsSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { getDocumentById, createGeneratedContent } from "@/db/queries";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate quizzes" },
        { status: 401 }
      );
    }

    // Check if this request includes a documentId (from blob storage)
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');
    
    let fileContent = '';
    let fileName = '';
    
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
        return NextResponse.json(
          { error: "Failed to fetch document from storage" },
          { status: 500 }
        );
      }
      
      const fileBuffer = await response.arrayBuffer();
      fileContent = `data:${document.fileType};base64,${Buffer.from(fileBuffer).toString('base64')}`;
      fileName = document.fileName;
    } else {
      // Original flow (direct upload)
      const { files } = await req.json();
      fileContent = files[0].data;
      fileName = files[0].name;
    }

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
          await createGeneratedContent({
            contentType: 'quiz',
            content: object,
            documentId,
          });
        }
      },
    });

    return new Response(result.textStream);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
} 