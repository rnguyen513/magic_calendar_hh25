import { NextRequest, NextResponse } from "next/server";
import { getDocumentById, deleteDocumentById, deleteGeneratedContentByDocumentId } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";
import { del } from "@vercel/blob";

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

// DELETE /api/documents/[documentId] - Delete a document
export async function DELETE(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to delete documents" },
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
        { error: "You don't have permission to delete this document" },
        { status: 403 }
      );
    }
    
    // Delete any generated content associated with the document
    await deleteGeneratedContentByDocumentId({ documentId });
    
    // Delete the document from Vercel Blob storage
    if (document.blobUrl) {
      await del(document.blobUrl);
    }
    
    // Delete the document from the database
    await deleteDocumentById({ id: documentId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
} 