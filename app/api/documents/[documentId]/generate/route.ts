import { NextRequest, NextResponse } from "next/server";
import { getDocumentById, createGeneratedContent } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";

// POST /api/documents/[documentId]/generate - Generate content from a document
export async function POST(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to generate content" },
        { status: 401 }
      );
    }

    const { documentId } = params;
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

    // Parse the request body to get the content type
    const { contentType } = await req.json();
    
    if (!contentType || (contentType !== 'summary' && contentType !== 'quiz')) {
      return NextResponse.json(
        { error: "Invalid content type. Must be 'summary' or 'quiz'" },
        { status: 400 }
      );
    }
    
    // Redirect to the appropriate API endpoint based on content type
    // This reuses the existing summary and quiz generation API routes
    if (contentType === 'summary') {
      // Return the URL to the summary API 
      return NextResponse.json({
        redirectUrl: `/api/summary?documentId=${documentId}`
      });
    } else {
      // Return the URL to the quiz API
      return NextResponse.json({
        redirectUrl: `/api/quizzes?documentId=${documentId}`
      });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
} 