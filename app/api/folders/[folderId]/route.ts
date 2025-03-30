import { NextRequest, NextResponse } from "next/server";
import { 
  getFolderById, 
  getDocumentsByFolderId, 
  deleteFolderById, 
  deleteDocumentById, 
  deleteGeneratedContentByDocumentId 
} from "@/db/queries";
import { auth } from "@/app/(auth)/auth";
import { del } from "@vercel/blob";

// GET /api/folders/[folderId] - Get a specific folder and its documents
export async function GET(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to access folder details" },
        { status: 401 }
      );
    }

    const { folderId } = params;
    const folder = await getFolderById({ id: folderId });
    
    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }
    
    // Check if the folder belongs to the current user
    if (folder.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this folder" },
        { status: 403 }
      );
    }
    
    // Get all documents in the folder
    const documents = await getDocumentsByFolderId({ folderId });
    
    return NextResponse.json({ folder, documents });
  } catch (error) {
    console.error("Error fetching folder details:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder details" },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[folderId] - Delete a specific folder
export async function DELETE(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to delete folders" },
        { status: 401 }
      );
    }

    const { folderId } = params;
    const folder = await getFolderById({ id: folderId });
    
    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }
    
    // Check if the folder belongs to the current user
    if (folder.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this folder" },
        { status: 403 }
      );
    }
    
    // Get all documents in the folder
    const documents = await getDocumentsByFolderId({ folderId });
    
    // Delete all documents in the folder first
    for (const document of documents) {
      // Delete any generated content associated with the document
      await deleteGeneratedContentByDocumentId({ documentId: document.id });
      
      // Delete the document from Vercel Blob storage
      if (document.blobUrl) {
        await del(document.blobUrl);
      }
      
      // Delete the document from the database
      await deleteDocumentById({ id: document.id });
    }
    
    // Delete the folder
    await deleteFolderById({ id: folderId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
} 