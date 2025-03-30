import { z } from "zod";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { getDocumentById, createGeneratedContent } from "@/db/queries";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";

// Summary schema definition
const summarySchema = z.object({
  summaryText: z.string(),
  keyPoints: z.array(z.string()),
  title: z.string(),
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate summaries" },
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
          await createGeneratedContent({
            contentType: 'summary',
            content: object,
            documentId,
          });
        }
      },
    });

    return new Response(result.textStream);
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
} 