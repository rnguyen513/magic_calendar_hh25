import { ProcessedAssignment } from "../canvas/calendar-processor";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the shape of prioritized assignments with AI-generated data
export interface PrioritizedAssignment extends ProcessedAssignment {
  priority: 'high' | 'medium' | 'low';
  aiNotes: string;
}

/**
 * Build a prompt for Gemini to prioritize assignments
 */
export function buildPrioritizationPrompt(assignments: ProcessedAssignment[]): string {
  // Convert assignments to a simplified format for the prompt
  const assignmentData = assignments.map(a => ({
    id: a.id,
    name: a.name,
    course: a.course,
    due_at: a.due_at,
    created_at: a.created_at,
    days_until_due: a.daysUntilDue,
    points_possible: a.points_possible,
    description: a.description ? a.description.substring(0, 200) + '...' : 'No description'
  }));

  // Create the prompt
  return `
You are an AI study assistant helping a student prioritize their Canvas assignments. 
Please analyze these assignments and prioritize them based on:
1. Due date (more urgent = higher priority)
2. Point value (higher points = higher priority)
3. Estimated time required (based on description complexity)

Here are the assignments in JSON format:
${JSON.stringify(assignmentData, null, 2)}

For each assignment, respond with a priority level (high, medium, or low) and a short note explaining why.
Format your response as a valid JSON array with objects containing: id, priority, and notes.
Example:
[
  {
    "id": 123,
    "priority": "high",
    "notes": "Due very soon and worth many points"
  },
  {
    "id": 456,
    "priority": "medium",
    "notes": "Important but you have more time"
  }
]
`;
}

/**
 * Call Gemini API to prioritize assignments
 */
export async function callGeminiAPI(prompt: string): Promise<{ id: number, priority: 'high' | 'medium' | 'low', notes: string }[] | null> {
  // Check for API key
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.warn("Missing Gemini API key. Set GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
    return null;
  }

  try {
    console.log("Calling Gemini API for assignment prioritization...");
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // First try with a more capable model
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-pro" });
    } catch (e) {
      console.log("Failed to use gemini-2.0-pro, falling back to gemini-1.5-flash");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    
    // Generate content with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Parse the response as JSON
      const parsedResponse = JSON.parse(text);
      
      // Validate the response structure
      if (!Array.isArray(parsedResponse)) {
        console.warn("Gemini API response is not an array");
        return null;
      }
      
      // Validate each item in the array
      const validResponse = parsedResponse.every(item => 
        typeof item === 'object' && 
        item !== null &&
        'id' in item && 
        'priority' in item && 
        'notes' in item
      );
      
      if (!validResponse) {
        console.warn("Gemini API response does not have the expected structure");
        return null;
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error("Failed to parse Gemini API response:", parseError);
      console.log("Raw response:", text);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

/**
 * Fallback prioritization method when AI is unavailable
 */
export function fallbackPrioritization(assignments: ProcessedAssignment[]): { id: number, priority: 'high' | 'medium' | 'low', notes: string }[] {
  return assignments.map(assignment => {
    // Simple prioritization logic based on due date and points
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let notes = "Auto-prioritized based on due date and points";
    
    if (assignment.daysUntilDue !== null) {
      if (assignment.daysUntilDue <= 3) {
        priority = 'high';
        notes = "Due soon (3 days or less)";
      } else if (assignment.daysUntilDue <= 7) {
        priority = 'medium';
        notes = "Due within a week";
      } else {
        priority = 'low';
        notes = "Due in more than a week";
      }
    }
    
    // Adjust based on points
    if (assignment.points_possible >= 50) {
      if (priority !== 'high') {
        priority = 'high';
        notes += ", high point value";
      }
    }
    
    return {
      id: assignment.id,
      priority,
      notes
    };
  });
}

/**
 * Main function to get prioritized assignments
 */
export async function getPrioritizedAssignments(assignments: ProcessedAssignment[]): Promise<PrioritizedAssignment[]> {
  if (assignments.length === 0) {
    console.log("No assignments to prioritize");
    return [];
  }
  
  console.log(`Prioritizing ${assignments.length} assignments...`);
  
  // Build prompt and call Gemini API
  const prompt = buildPrioritizationPrompt(assignments);
  const aiResponse = await callGeminiAPI(prompt);
  
  // Use AI response or fallback
  const priorityData = aiResponse || fallbackPrioritization(assignments);
  
  // Merge the assignment data with the priority data
  const prioritizedAssignments: PrioritizedAssignment[] = assignments.map(assignment => {
    const priorityInfo = priorityData.find(p => p.id === assignment.id);
    
    return {
      ...assignment,
      priority: priorityInfo?.priority || 'medium',
      aiNotes: priorityInfo?.notes || 'No AI notes available'
    };
  });
  
  // Sort by priority (high first) and then by due date
  return prioritizedAssignments.sort((a, b) => {
    // First sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by due date
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });
}

/**
 * Actual implementation would integrate with the Gemini API
 * This is a placeholder for the future implementation
 */
export async function realGeminiImplementation() {
  // TODO: Implement actual Gemini API integration when ready
} 