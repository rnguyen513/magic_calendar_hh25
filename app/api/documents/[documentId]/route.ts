import { NextRequest, NextResponse } from "next/server";
import { getDocumentById } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";

// GET /api/documents/[documentId] - Get document details
export async function GET(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to access document details" },
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
    
    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document details" },
      { status: 500 }
    );
  }
} 