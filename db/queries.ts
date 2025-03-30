import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation, folder, document, generatedContent, Folder, Document, GeneratedContent } from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
}

// Folder queries
export async function createFolder({
  folderName,
  userId,
}: {
  folderName: string;
  userId: string;
}) {
  try {
    const [newFolder] = await db
      .insert(folder)
      .values({
        folderName,
        userId,
        createdAt: new Date(),
      })
      .returning();
    
    return newFolder;
  } catch (error) {
    console.error("Failed to create folder in database");
    throw error;
  }
}

export async function getFoldersByUserId({ userId }: { userId: string }): Promise<Folder[]> {
  try {
    return await db
      .select()
      .from(folder)
      .where(eq(folder.userId, userId))
      .orderBy(desc(folder.createdAt));
  } catch (error) {
    console.error("Failed to get folders by user from database");
    throw error;
  }
}

export async function getFolderById({ id }: { id: string }): Promise<Folder | undefined> {
  try {
    const [selectedFolder] = await db
      .select()
      .from(folder)
      .where(eq(folder.id, id));
    
    return selectedFolder;
  } catch (error) {
    console.error("Failed to get folder by id from database");
    throw error;
  }
}

export async function deleteFolderById({ id }: { id: string }) {
  try {
    await db.delete(folder).where(eq(folder.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete folder from database");
    throw error;
  }
}

// Document queries
export async function createDocument({
  fileName,
  fileType,
  fileSize,
  blobUrl,
  folderId,
  userId,
}: {
  fileName: string;
  fileType: string;
  fileSize: string;
  blobUrl: string;
  folderId: string;
  userId: string;
}): Promise<Document> {
  try {
    const [newDocument] = await db
      .insert(document)
      .values({
        fileName,
        fileType,
        fileSize,
        blobUrl,
        folderId,
        userId,
        createdAt: new Date(),
      })
      .returning();
    
    return newDocument;
  } catch (error) {
    console.error("Failed to create document in database");
    throw error;
  }
}

export async function getDocumentsByFolderId({ folderId }: { folderId: string }): Promise<Document[]> {
  try {
    return await db
      .select()
      .from(document)
      .where(eq(document.folderId, folderId))
      .orderBy(desc(document.createdAt));
  } catch (error) {
    console.error("Failed to get documents by folder from database");
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }): Promise<Document | undefined> {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id));
    
    return selectedDocument;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function checkDocumentExists({ fileName, folderId }: { fileName: string; folderId: string }): Promise<boolean> {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.fileName, fileName),
          eq(document.folderId, folderId)
        )
      );
    
    return documents.length > 0;
  } catch (error) {
    console.error("Failed to check if document exists");
    throw error;
  }
}

// Generated content queries
export async function createGeneratedContent({
  contentType,
  content,
  documentId,
}: {
  contentType: string;
  content: any;
  documentId: string;
}): Promise<GeneratedContent> {
  try {
    const [newContent] = await db
      .insert(generatedContent)
      .values({
        contentType,
        content: JSON.stringify(content),
        documentId,
        createdAt: new Date(),
      })
      .returning();
    
    return newContent;
  } catch (error) {
    console.error("Failed to create generated content in database");
    throw error;
  }
}

export async function getGeneratedContentByDocumentId({ documentId }: { documentId: string }): Promise<GeneratedContent[]> {
  try {
    return await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.documentId, documentId))
      .orderBy(desc(generatedContent.createdAt));
  } catch (error) {
    console.error("Failed to get generated content by document from database");
    throw error;
  }
}