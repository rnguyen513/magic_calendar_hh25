import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { syllabusEventsToCalendarEvents } from "@/lib/services/syllabus-parser-service";
import { extractTextFromPDF } from "@/lib/services/pdf-extractor-service";

// Set max duration for long-running requests
export const maxDuration = 60;

// Define schema for syllabi data
const syllabusEventSchema = z.object({
  title: z.string(),
  category: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  notes: z.string().optional(),
});

const syllabusSchema = z.object({
  events: z.array(syllabusEventSchema),
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
  instructor: z.string().optional(),
  term: z.string().optional(),
});

// Check if the Google API key is available
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!googleApiKey) {
  console.warn("Warning: GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables");
}

/**
 * API endpoint to process a syllabus PDF and extract events
 * 
 * This endpoint:
 * 1. Receives a base64-encoded PDF file
 * 2. Processes the content with Gemini AI using direct file handling
 * 3. Converts the AI-processed data into calendar events
 * 4. Returns the events for display in the calendar
 */
export async function POST(req: NextRequest) {
  try {
    console.log("Syllabus processing request received");
    
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    
    if (!body.file?.data) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 });
    }

    console.log("File received, size:", (body.file.data.length / 1024).toFixed(2) + " KB");
    const fileContent = body.file.data;
    
    // Extract text from PDF for debugging
    try {
      console.log("Attempting to extract text from PDF for debugging...");
      const pdfText = await extractTextFromPDF(fileContent);
      // Log only a preview of the text to avoid overwhelming the console
      const textPreview = pdfText.length > 500 ? pdfText.substring(0, 500) + "..." : pdfText;
      console.log("--- PDF TEXT PREVIEW START ---");
      console.log(textPreview);
      console.log("--- PDF TEXT PREVIEW END ---");
      console.log(`Total PDF text length: ${pdfText.length} characters`);
    } catch (error) {
      console.error("Error extracting text from PDF for debugging:", error);
    }
    
    try {
      // Explicitly use the environment variable
      if (!googleApiKey) {
        throw new Error("Google API key is not configured");
      }

      // Set environment variable explicitly if it's not being picked up automatically
      process.env.GOOGLE_API_KEY = googleApiKey;

      console.log("Starting Gemini AI processing");
      
      // Create a buffer to capture the streamed response for debugging
      let capturedResponse = "";
      
      // Use the streamObject function with direct response streaming
      const result = await streamObject({
        model: google("gemini-1.5-pro-latest"),
        messages: [
          {
            role: "system",
            content: `You are an AI study assistant helping a student organize their academic calendar. 
                      Your task is to analyze a syllabus PDF and extract all date-related events such as:
                      - Exams, quizzes, and tests
                      - Assignment due dates
                      - Project deadlines
                      - Presentation dates
                      - Important class activities
                      - Office hours (recurring events)
                      
                      For each event, provide detailed information formatted according to the schema.
                      
                      IMPORTANT: For dates in the format "Wed, Apr 16" or similar, make sure you format the startDate and endDate as a proper ISO date string (YYYY-MM-DD) using the current year. For example, "Wed, Apr 16" should become "2024-04-16T23:59:00"
                      
                      Please ensure your date format is correct, as it will be used to create calendar events.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all important dates and events from this syllabus to help me plan my academic schedule.",
              },
              {
                type: "file",
                data: fileContent,
                mimeType: "application/pdf",
              },
            ],
          },
        ],
        schema: syllabusSchema,
        onFinish: async ({ object }) => {
          console.log("Gemini AI processing complete", object ? `with ${object.events?.length || 0} events` : "with no events");
          
          // Validate schema
          const validation = syllabusSchema.safeParse(object);
          if (validation.error) {
            console.error("Schema validation error:", validation.error.errors);
          }
          
          // Debug the actual event dates coming from Gemini
          if (object && object.events && object.events.length > 0) {
            console.log("--- GEMINI EXTRACTED EVENTS ---");
            object.events.forEach((event, index) => {
              console.log(`Event ${index + 1}: "${event.title}"`);
              console.log(`  Category: ${event.category}`);
              console.log(`  StartDate: ${event.startDate}`);
              console.log(`  EndDate: ${event.endDate}`);
              console.log(`  Priority: ${event.priority}`);
            });
            console.log("--- END GEMINI EXTRACTED EVENTS ---");
          }
        },
      });
      
      // Attach an additional event handler to the textStream to capture the raw response
      const originalTextStream = result.textStream;
      const newTextStream = new ReadableStream({
        async start(controller) {
          const reader = originalTextStream.getReader();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                console.log("--- CAPTURED RAW GEMINI RESPONSE PREVIEW ---");
                const preview = capturedResponse.length > 500 ? 
                  capturedResponse.substring(0, 500) + "..." : 
                  capturedResponse;
                console.log(preview);
                console.log("--- END CAPTURED RAW GEMINI RESPONSE PREVIEW ---");
                break;
              }
              
              // Capture a portion of the response for debugging
              if (capturedResponse.length < 10000) {
                capturedResponse += value;
              }
              
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
          }
        }
      });
      
      // Return the new stream that includes debugging
      return new Response(newTextStream);
    } catch (error) {
      console.error("Error processing with AI model:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to process syllabus with AI" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing syllabus:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process syllabus" },
      { status: 500 }
    );
  }
} 