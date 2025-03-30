import { NextRequest, NextResponse } from "next/server";
import { getFolderById, getDocumentsByFolderId } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";

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