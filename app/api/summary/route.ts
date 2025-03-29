import { z } from "zod";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

// Summary schema definition
const summarySchema = z.object({
  summaryText: z.string(),
  keyPoints: z.array(z.string()),
  title: z.string(),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  const result = await streamObject({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "system",
        content:
          "You are a helpful study assistant. Your job is to create a comprehensive summary of the provided document, extracting key points and concepts.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create a detailed summary of this document. Include the main concepts, important details, and key takeaways.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: summarySchema,
    onFinish: ({ object }) => {
      const res = summarySchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return new Response(result.textStream);
} 