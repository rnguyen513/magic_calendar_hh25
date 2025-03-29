import { NextRequest, NextResponse } from 'next/server';
import { ProcessedAssignment } from '../../../lib/canvas/calendar-processor';
import { getPrioritizedAssignments } from '../../../lib/ai/gemini-calendar';
import { transformAssignmentsToEvents } from '../../../lib/services/calendar-event-service';

/**
 * API route to prioritize assignments using Gemini AI
 * POST /api/calendar-priorities
 */
export async function POST(req: NextRequest) {
  try {
    // Log the request
    console.log('Received request to prioritize assignments');
    
    // Parse the request body
    const assignments: ProcessedAssignment[] = await req.json();
    
    if (!Array.isArray(assignments)) {
      console.error('Invalid request body format: not an array');
      return NextResponse.json(
        { error: 'Invalid request body. Expected an array of assignments.' },
        { status: 400 }
      );
    }
    
    if (assignments.length === 0) {
      console.warn('Empty assignments array received');
      return NextResponse.json(
        { 
          prioritizedAssignments: [],
          calendarEvents: [],
          message: 'No assignments to prioritize.'
        }
      );
    }
    
    console.log(`Processing ${assignments.length} assignments with Gemini AI`);
    
    // Process assignments with Gemini
    const prioritizedAssignments = await getPrioritizedAssignments(assignments);
    
    console.log('Assignments prioritized, transforming to calendar events');
    
    // Transform to calendar events
    const calendarEvents = transformAssignmentsToEvents(prioritizedAssignments);
    
    console.log(`Transformed ${calendarEvents.length} assignments into calendar events`);
    
    // Return both the prioritized assignments and calendar events
    return NextResponse.json({
      prioritizedAssignments,
      calendarEvents,
      message: `Successfully prioritized ${assignments.length} assignments and created ${calendarEvents.length} calendar events.`
    });
  } catch (error: any) {
    console.error('Error processing assignments:', error);
    
    return NextResponse.json(
      { 
        error: `Failed to process assignments: ${error.message}`,
        details: error.stack
      },
      { status: 500 }
    );
  }
} 