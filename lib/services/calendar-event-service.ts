import { PrioritizedAssignment } from "../ai/gemini-calendar";

// This type corresponds to the Event type from the Scheduler
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  variant: 'primary' | 'success' | 'default' | 'warning' | 'danger'; // Match the variants in scheduler-provider.tsx
}

/**
 * Generate a consistent event ID from assignment ID
 */
export function generateEventId(assignmentId: number): string {
  return `canvas-assignment-${assignmentId}`;
}

/**
 * Map priority to calendar event variant
 * 
 * This function maps the priority levels from the AI analysis
 * to the appropriate calendar color variants:
 * - high priority -> danger (red)
 * - medium priority -> warning (orange/yellow)
 * - low priority -> success (green)
 */
export function priorityToVariant(priority: 'high' | 'medium' | 'low'): CalendarEvent['variant'] {
  switch (priority) {
    case 'high':
      return 'danger'; // Red for high priority
    case 'medium':
      return 'warning'; // Yellow/orange for medium priority
    case 'low':
      return 'success'; // Green for low priority
    default:
      return 'primary'; // Blue for default
  }
}

/**
 * Calculate event end time (defaults to 1 hour after start)
 */
function calculateEndTime(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration
  return endDate;
}

/**
 * Format assignment title for calendar
 */
function formatEventTitle(assignment: PrioritizedAssignment): string {
  return `[${assignment.course}] ${assignment.name}`;
}

/**
 * Format assignment description for calendar
 */
function formatEventDescription(assignment: PrioritizedAssignment): string {
  const pointsText = assignment.points_possible 
    ? `Points: ${assignment.points_possible}\n` 
    : '';
  
  const dueText = assignment.daysUntilDue !== null 
    ? `Due in ${assignment.daysUntilDue} days\n` 
    : 'No due date specified\n';
  
  return `${pointsText}${dueText}Priority: ${assignment.priority} (${assignment.aiNotes})`;
}

/**
 * Transform a prioritized assignment into a calendar event
 * 
 * Note: Canvas assignments typically only have a due date (end time),
 * not a start time. We treat the due date as the end time and
 * create a start time 1 hour before for display purposes.
 */
export function assignmentToCalendarEvent(assignment: PrioritizedAssignment): CalendarEvent | null {
  // Ensure we have a due date
  if (!assignment.due_at) {
    console.warn(`Assignment ${assignment.id} has no due date, skipping`);
    return null;
  }
  
  // Use due date as end time
  const endDate = new Date(assignment.due_at);
  
  // Create a start time 1 hour before the due time
  const startDate = new Date(endDate);
  startDate.setHours(startDate.getHours() - 1);
  
  const variant = priorityToVariant(assignment.priority);
  
  return {
    id: generateEventId(assignment.id),
    title: formatEventTitle(assignment),
    description: formatEventDescription(assignment),
    startDate: startDate,
    endDate: endDate,
    variant: variant
  };
}

/**
 * Transform multiple prioritized assignments into calendar events
 */
export function transformAssignmentsToEvents(assignments: PrioritizedAssignment[]): CalendarEvent[] {
  return assignments
    .map(assignmentToCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null); // Filter out null events
} 