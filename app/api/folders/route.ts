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
    const folders = await getFoldersByUserId({ userId });

    return NextResponse.json({ folders });
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
    const newFolder = await createFolder({ folderName, userId });

    return NextResponse.json({ folder: newFolder }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
} 