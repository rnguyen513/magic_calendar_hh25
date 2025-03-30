import { NextRequest, NextResponse } from "next/server";
import { getFolderById, createDocument, checkDocumentExists } from "@/db/queries";
import { auth } from "@/app/(auth)/auth";
import { put } from "@vercel/blob";

// POST /api/folders/[folderId]/documents - Upload a document to a specific folder
export async function POST(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to upload documents" },
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
        { error: "You don't have permission to upload to this folder" },
        { status: 403 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }
    
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit" },
        { status: 400 }
      );
    }
    
    // Check if a file with the same name already exists in this folder
    const fileExists = await checkDocumentExists({ 
      fileName: file.name,
      folderId 
    });
    
    if (fileExists) {
      return NextResponse.json(
        { error: "A file with this name already exists in the folder" },
        { status: 409 }
      );
    }
    
    // Upload the file to Vercel Blob storage
    const blob = await put(file.name, file, {
      access: 'public',
    });
    
    // Create a document record in the database
    const document = await createDocument({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size.toString(),
      blobUrl: blob.url,
      folderId,
      userId: session.user.id,
    });
    
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
} 