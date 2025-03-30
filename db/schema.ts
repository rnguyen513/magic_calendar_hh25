import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
  text,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

export const reservation = pgTable("Reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>;

// New tables for the folder-based organization system
export const folder = pgTable("Folder", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  folderName: varchar("folderName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Folder = InferSelectModel<typeof folder>;

export const document = pgTable("Document", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  fileSize: varchar("fileSize", { length: 20 }).notNull(),
  blobUrl: text("blobUrl").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  folderId: uuid("folderId")
    .notNull()
    .references(() => folder.id),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Document = InferSelectModel<typeof document>;

export const generatedContent = pgTable("GeneratedContent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  contentType: varchar("contentType", { length: 50 }).notNull(), // 'summary' or 'quiz'
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  documentId: uuid("documentId")
    .notNull()
    .references(() => document.id),
});

export type GeneratedContent = InferSelectModel<typeof generatedContent>;
