import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { auth } from "@/app/(auth)/auth";
import { eq } from "drizzle-orm";
import { generatedContent, document } from "@/db/schema";

// Initialize the drizzle client
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export async function GET(
  req: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to access content" },
        { status: 401 }
      );
    }

    const { contentId } = params;
    
    // Get the content item
    const [contentItem] = await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.id, contentId));
    
    if (!contentItem) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }
    
    // Get the associated document
    const [documentInfo] = await db
      .select()
      .from(document)
      .where(eq(document.id, contentItem.documentId));
    
    // Check if the document belongs to the current user
    if (documentInfo && documentInfo.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this content" },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ contentItem, documentInfo });
  } catch (error) {
    console.error("Error fetching generated content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
} 