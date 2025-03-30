import { NextRequest, NextResponse } from "next/server";
import { createFolder, getFoldersByUserId } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";

// GET /api/folders - Get all folders for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to access folders" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    try {
      const folders = await getFoldersByUserId({ userId });
      return NextResponse.json({ folders });
    } catch (dbError: any) {
      console.error("Failed to get folders by user from database", dbError);
      // If table doesn't exist yet, return empty array instead of error
      if (dbError.message && dbError.message.includes('relation "Folder" does not exist')) {
        return NextResponse.json({ folders: [] });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST /api/folders - Create a new folder
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create folders" },
        { status: 401 }
      );
    }

    const { folderName } = await req.json();
    
    if (!folderName || typeof folderName !== 'string' || folderName.trim() === '') {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    try {
      const newFolder = await createFolder({ folderName, userId });
      return NextResponse.json({ folder: newFolder }, { status: 201 });
    } catch (dbError: any) {
      console.error("Failed to create folder in database", dbError);
      // If table doesn't exist yet, return a helpful error
      if (dbError.message && dbError.message.includes('relation "Folder" does not exist')) {
        return NextResponse.json(
          { error: "Database not initialized. Please run migrations first." },
          { status: 500 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
} 