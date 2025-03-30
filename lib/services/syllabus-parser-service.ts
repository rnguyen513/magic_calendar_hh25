import { CalendarEvent, priorityToVariant } from "./calendar-event-service";

export interface SyllabusEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: string;
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

export interface ProcessedSyllabusData {
  events: SyllabusEvent[];
  courseCode?: string;
  courseName?: string;
  instructor?: string;
  term?: string;
  rawEvents?: any[];
}

/**
 * Generate a unique ID for a syllabus event
 */
export function generateSyllabusEventId(eventTitle: string, date: Date): string {
  const timestamp = date.getTime();
  const eventTitleHash = eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  
  return `syllabus-${eventTitleHash}-${timestamp}`;
}

/**
 * Format the event description for display
 */
function formatEventDescription(event: SyllabusEvent): string {
  let description = event.title;
  
  if (event.notes && event.notes.trim() !== '') {
    description += `\n\nNotes: ${event.notes}`;
  }
  
  return description;
}

/**
 * Convert syllabus events to calendar events
 * 
 * This formats the processed syllabus events from the AI into
 * calendar events that the scheduler component can display.
 */
export function syllabusEventsToCalendarEvents(
  syllabusEvents: SyllabusEvent[]
): CalendarEvent[] {
  console.log("DEBUG - Converting syllabus events to calendar events");
  
  return syllabusEvents.map((event, index) => {
    // Debug the incoming event
    console.log(`\nSyllabus event ${index + 1}: "${event.title}"`);
    console.log("  Incoming dates before transformation:");
    console.log(`  - Start date: ${event.startDate instanceof Date ? event.startDate.toString() : 'Not a Date object!'}`);
    console.log(`  - Start date components: ${event.startDate instanceof Date ? 
      `Year=${event.startDate.getFullYear()}, Month=${event.startDate.getMonth()+1}, Day=${event.startDate.getDate()}` : 
      'N/A'}`);
    console.log(`  - End date: ${event.endDate instanceof Date ? event.endDate.toString() : 'Not a Date object!'}`);
    console.log(`  - End date components: ${event.endDate instanceof Date ? 
      `Year=${event.endDate.getFullYear()}, Month=${event.endDate.getMonth()+1}, Day=${event.endDate.getDate()}` : 
      'N/A'}`);
      
    // Get color variant based on priority
    const variant = priorityToVariant(event.priority || 'medium');
    
    // Create standardized dates to avoid duplication
    const standardizedStartDate = event.startDate instanceof Date ? 
      new Date(
        event.startDate.getFullYear(),
        event.startDate.getMonth(),
        event.startDate.getDate(),
        12, 0, 0 // Standardize to noon
      ) : 
      new Date();
      
    const standardizedEndDate = event.endDate instanceof Date ? 
      new Date(
        event.endDate.getFullYear(),
        event.endDate.getMonth(),
        event.endDate.getDate(),
        13, 0, 0 // Standardize to 1 PM (1 hour after start)
      ) : 
      new Date(standardizedStartDate.getTime() + 60 * 60 * 1000); // 1 hour later
    
    // Create calendar event with standardized times
    const calendarEvent = {
      id: event.id || generateSyllabusEventId(event.title, standardizedEndDate),
      title: `[Syllabus] ${event.title}`,
      description: formatEventDescription(event),
      startDate: standardizedStartDate,
      endDate: standardizedEndDate,
      variant: variant,
      source: 'syllabus' // Add source identification
    };
    
    // Debug the outgoing calendar event
    console.log("  Outgoing calendar event after transformation:");
    console.log(`  - Start date: ${calendarEvent.startDate instanceof Date ? calendarEvent.startDate.toString() : 'Not a Date object!'}`);
    console.log(`  - Start date components: ${calendarEvent.startDate instanceof Date ? 
      `Year=${calendarEvent.startDate.getFullYear()}, Month=${calendarEvent.startDate.getMonth()+1}, Day=${calendarEvent.startDate.getDate()}` : 
      'N/A'}`);
    console.log(`  - End date: ${calendarEvent.endDate instanceof Date ? calendarEvent.endDate.toString() : 'Not a Date object!'}`);
    console.log(`  - End date components: ${calendarEvent.endDate instanceof Date ? 
      `Year=${calendarEvent.endDate.getFullYear()}, Month=${calendarEvent.endDate.getMonth()+1}, Day=${calendarEvent.endDate.getDate()}` : 
      'N/A'}`);
      
    return calendarEvent;
  });
}

/**
 * Save the syllabus PDF to localStorage for later viewing
 * 
 * @param pdfBase64 The base64-encoded PDF content
 * @param filename The original filename of the PDF
 */
export function saveSyllabusPDF(pdfBase64: string, filename: string): void {
  try {
    // Store metadata about the syllabus
    const syllabusMetadata = {
      filename,
      uploadedAt: new Date().toISOString(),
      hasEvents: true
    };
    
    // Store only the base64 content without the Data URL prefix
    const base64Content = pdfBase64.includes('base64,') 
      ? pdfBase64.split('base64,')[1] 
      : pdfBase64;
    
    // Save metadata and PDF content to localStorage
    localStorage.setItem('syllabusMetadata', JSON.stringify(syllabusMetadata));
    localStorage.setItem('syllabusPdfContent', base64Content);
    
    console.log("Syllabus PDF saved to localStorage");
  } catch (error) {
    console.error("Failed to save syllabus PDF to localStorage:", error);
  }
}

/**
 * Check if a syllabus PDF has been uploaded and stored
 * 
 * @returns Boolean indicating if a syllabus PDF is available
 */
export function hasSyllabusPDF(): boolean {
  const metadata = localStorage.getItem('syllabusMetadata');
  const content = localStorage.getItem('syllabusPdfContent');
  return !!metadata && !!content;
}

/**
 * Get the stored syllabus PDF content and metadata
 * 
 * @returns Object with PDF content and metadata, or null if not available
 */
export function getSyllabusPDF(): { content: string, metadata: any } | null {
  try {
    const metadata = localStorage.getItem('syllabusMetadata');
    const content = localStorage.getItem('syllabusPdfContent');
    
    if (!metadata || !content) {
      return null;
    }
    
    return {
      content: `data:application/pdf;base64,${content}`,
      metadata: JSON.parse(metadata)
    };
  } catch (error) {
    console.error("Failed to retrieve syllabus PDF from localStorage:", error);
    return null;
  }
} 