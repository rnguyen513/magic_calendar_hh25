import { GoogleGenerativeAI } from "@google/generative-ai";
import { SyllabusEvent, ProcessedSyllabusData } from "../services/syllabus-parser-service";

/**
 * Build a prompt for Gemini to extract and prioritize syllabus events
 */
export function buildSyllabusPrioritizationPrompt(syllabusContent: string): string {
  return `
You are an AI study assistant helping a student organize their academic calendar. 
Please analyze this syllabus PDF text and extract all date-related events such as:
- Exams, quizzes, and tests
- Assignment due dates
- Project deadlines
- Presentation dates
- Important class activities
- Office hours (recurring events)

For each event, please provide the following information:
- title: Brief, descriptive title of the event
- category: Type of event (exam, assignment, project, etc.)
- startDate: Formatted as ISO string (e.g., 2023-11-15T09:00:00)
- endDate: Formatted as ISO string (e.g., 2023-11-15T10:30:00)
- priority: "high", "medium", or "low" based on importance (exams/finals should be high)
- notes: Any relevant additional information (grading weight, requirements, etc.)

Also extract the following information if available:
- courseCode: Course code/number
- courseName: Name of the course
- instructor: Name of the instructor
- term: Semester/term information

Format your response as valid JSON with "events" and course information properties:
{
  "events": [
    {
      "title": "Midterm Exam",
      "category": "exam",
      "startDate": "2023-10-20T14:00:00",
      "endDate": "2023-10-20T16:00:00",
      "priority": "high",
      "notes": "Covers chapters 1-5, worth 30% of final grade"
    },
    ...
  ],
  "courseCode": "CS101",
  "courseName": "Introduction to Computer Science",
  "instructor": "Dr. Smith",
  "term": "Fall 2023"
}

Here is the syllabus content to analyze:
${syllabusContent}
`;
}

/**
 * Call Gemini API to process syllabus content
 */
export async function callGeminiForSyllabus(syllabusContent: string): Promise<ProcessedSyllabusData | null> {
  // Check for API key
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.warn("Missing Gemini API key. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
    return null;
  }

  try {
    console.log("Calling Gemini API for syllabus processing...");
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try with the most capable model available
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-pro" });
    } catch (e) {
      console.log("Failed to use gemini-2.0-pro, falling back to gemini-1.5-flash");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    
    const prompt = buildSyllabusPrioritizationPrompt(syllabusContent);
    
    // Generate content with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Parse the response as JSON
      const parsedResponse = JSON.parse(text);
      
      // Validate the response structure
      if (!parsedResponse.events || !Array.isArray(parsedResponse.events)) {
        console.warn("Gemini API response does not contain events array");
        return { events: [] };
      }
      
      // Process each event to ensure dates are valid
      const processedEvents = parsedResponse.events.map((event: any) => {
        try {
          // Parse dates or use current date as fallback
          const startDate = event.startDate ? new Date(event.startDate) : new Date();
          const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate);
          
          // Add one hour to end date if it's the same as start date
          if (endDate.getTime() === startDate.getTime()) {
            endDate.setHours(endDate.getHours() + 1);
          }
          
          return {
            ...event,
            startDate,
            endDate,
            // Default to medium priority if not specified
            priority: event.priority || 'medium',
          };
        } catch (e) {
          console.error("Error processing event date:", e);
          return null;
        }
      }).filter(Boolean);
      
      return {
        events: processedEvents as SyllabusEvent[],
        courseCode: parsedResponse.courseCode,
        courseName: parsedResponse.courseName,
        instructor: parsedResponse.instructor,
        term: parsedResponse.term,
        rawEvents: parsedResponse.events
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini API response:", parseError);
      console.log("Raw response:", text);
      return { events: [] };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { events: [] };
  }
}

/**
 * Fallback event extraction when AI is unavailable
 * This is a very basic extraction that looks for date patterns
 */
export function fallbackSyllabusProcessing(syllabusContent: string): ProcessedSyllabusData {
  const events: SyllabusEvent[] = [];
  const currentYear = new Date().getFullYear();
  
  // Simple regex pattern to match dates with potential events
  const datePattern = /(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[.\s]+(\d{1,2})(?:[,\s]+(\d{4}))?(?:[:\s-]+([^.!?\n]+))?/gi;
  
  let match;
  while ((match = datePattern.exec(syllabusContent)) !== null) {
    try {
      const monthName = match[0].slice(0, 3).toLowerCase();
      const dayNumber = parseInt(match[1]);
      const year = match[2] ? parseInt(match[2]) : currentYear;
      const description = match[3]?.trim() || 'Unknown event';
      
      // Map month name to month number
      const monthMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      
      const month = monthMap[monthName] || 0;
      
      // Create date objects
      const startDate = new Date(year, month, dayNumber, 9, 0, 0);
      const endDate = new Date(year, month, dayNumber, 10, 0, 0);
      
      // Skip dates that are invalid or too far in the past
      const now = new Date();
      if (isNaN(startDate.getTime()) || startDate < new Date(now.getFullYear() - 1, 0, 1)) {
        continue;
      }
      
      // Try to determine if this is a high priority event
      const isHighPriority = /\b(?:exam|final|midterm|test|quiz)\b/i.test(description);
      const isMediumPriority = /\b(?:assignment|project|paper|due|deadline)\b/i.test(description);
      
      const priority = isHighPriority ? 'high' : (isMediumPriority ? 'medium' : 'low');
      
      // Generate a unique ID
      const id = `syllabus-${month}-${dayNumber}-${year}-${description.substring(0, 10).replace(/\s/g, '')}`;
      
      events.push({
        id,
        title: description,
        description: description,
        startDate,
        endDate,
        category: isHighPriority ? 'exam' : (isMediumPriority ? 'assignment' : 'event'),
        priority,
        notes: ''
      });
    } catch (e) {
      console.error("Error processing date match:", e);
      continue;
    }
  }
  
  return { events };
}

/**
 * Main function to process syllabus content
 */
export async function processSyllabus(syllabusContent: string): Promise<ProcessedSyllabusData> {
  if (!syllabusContent || syllabusContent.length < 10) {
    console.warn("Syllabus content is too short or empty");
    return { events: [] };
  }
  
  try {
    // First try using the AI-powered extraction
    const aiResult = await callGeminiForSyllabus(syllabusContent);
    
    if (aiResult && aiResult.events && aiResult.events.length > 0) {
      return aiResult;
    }
    
    // Fall back to basic extraction if AI failed
    console.log("AI extraction failed, using fallback extraction");
    return fallbackSyllabusProcessing(syllabusContent);
  } catch (error) {
    console.error("Error in syllabus processing:", error);
    // Try fallback as a last resort
    return fallbackSyllabusProcessing(syllabusContent);
  }
} 