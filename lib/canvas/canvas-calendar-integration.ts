import { getAllUpcomingAssignments, ProcessedAssignment } from './calendar-processor';
import { getPrioritizedAssignments, PrioritizedAssignment } from '../ai/gemini-calendar';
import { CalendarEvent, priorityToVariant } from '../services/calendar-event-service';

/**
 * Convert Canvas assignments to calendar events
 * 
 * This formats the prioritized assignments from Gemini into events
 * that the calendar component can understand.
 * 
 * Events will be shown only on their due date, with end time matching
 * the assignment due date/time. For assignments, we're only concerned
 * about when they're due (the end time), not when they start.
 */
export function assignmentsToCalendarEvents(
  assignments: PrioritizedAssignment[]
): CalendarEvent[] {
  return assignments.map(assignment => {
    // Skip assignments without due dates
    if (!assignment.due_at) {
      console.warn(`Assignment ${assignment.name} has no due date, skipping`);
      return null;
    }

    // Get priority variant based on AI prioritization
    const variant = priorityToVariant(assignment.priority || 'medium');
    
    // Parse the due date as the end time
    const endDate = new Date(assignment.due_at);
    
    // Set start date to the same as end date
    // For assignments, we only care about the due date (end date)
    // This is a better representation of how assignments work
    const startDate = new Date(endDate);
    
    // Store created_at date for displaying in description
    let createdAtStr = "Unknown";
    if (assignment.created_at) {
      const createdDate = new Date(assignment.created_at);
      createdAtStr = `${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`;
    }
    
    // Format the event for the calendar
    return {
      id: `canvas-${assignment.id}`,
      title: `[${assignment.course}] ${assignment.name}`,
      description: `
Course: ${assignment.course}
Points: ${assignment.points_possible}
Priority: ${assignment.priority}
${assignment.aiNotes}

Available since: ${createdAtStr}
Due: ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}

${assignment.description ? 'Assignment details: ' + assignment.description.substring(0, 200) + '...' : ''}
      `.trim(),
      startDate: startDate,
      endDate: endDate,
      variant: variant
    };
  }).filter(Boolean) as CalendarEvent[];
}

/**
 * Complete workflow to fetch assignments from Canvas,
 * prioritize them with Gemini AI, and convert to calendar events
 */
export async function fetchAndProcessCanvasAssignments(): Promise<{
  events: CalendarEvent[];
  rawAssignments: PrioritizedAssignment[];
}> {
  try {
    // Step 1: Fetch assignments from Canvas
    // console.log("Fetching assignments from Canvas...");
    const assignments = await getAllUpcomingAssignments();
    
    if (assignments.length === 0) {
      // console.log("No upcoming assignments found in Canvas");
      return { events: [], rawAssignments: [] };
    }
    
    // console.log(`Found ${assignments.length} upcoming assignments in Canvas`);
    
    // Step 2: Use Gemini to prioritize assignments
    // console.log("Sending assignments to Gemini for prioritization...");
    const prioritizedAssignments = await getPrioritizedAssignments(assignments);
    
    // Step 3: Convert to calendar events
    // console.log("Converting prioritized assignments to calendar events...");
    const events = assignmentsToCalendarEvents(prioritizedAssignments);
    
    // console.log(`Created ${events.length} calendar events from Canvas assignments`);
    
    return {
      events,
      rawAssignments: prioritizedAssignments
    };
  } catch (error: any) {
    console.error("Error in Canvas-Calendar integration:", error);
    throw new Error(`Failed to process Canvas assignments: ${error.message}`);
  }
} 