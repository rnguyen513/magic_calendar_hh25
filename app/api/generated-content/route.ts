import { NextRequest, NextResponse } from "next/server";
import { getGeneratedContentByDocumentId } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to access generated content" },
        { status: 401 }
      );
    }

    // Get documentId from URL query params
    const url = new URL(req.url);
    const documentId = url.searchParams.get("documentId");
    
    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }
    
    // Get all generated content for the document
    const generatedContent = await getGeneratedContentByDocumentId({ documentId });
    
    return NextResponse.json({ generatedContent });
  } catch (error) {
    console.error("Error fetching generated content:", error);
    return NextResponse.json(
      { error: "Failed to fetch generated content" },
      { status: 500 }
    );
  }
} 