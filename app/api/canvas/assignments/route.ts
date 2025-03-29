import { NextResponse } from 'next/server';
import { fetchCanvasAssignments } from '../../../../courseInfoToAi';

/**
 * API route to fetch Canvas assignments
 * This endpoint provides a server-side way to access Canvas data
 * which allows us to use the API token securely
 */
export async function GET() {
  console.log('Canvas assignments API route called');
  
  try {
    // Validate token existence
    if (!process.env.CANVAS_ACCESS_TOKEN) {
      console.error('No Canvas ACCESS_TOKEN found in environment variables');
      return NextResponse.json(
        { error: 'No Canvas API token configured' },
        { status: 500 }
      );
    }

    // Fetch assignments using the server-side function
    const assignments = await fetchCanvasAssignments();
    console.log(`API route fetched ${assignments.length} assignments`);
    
    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error('Error in Canvas assignments API route:', error);
    return NextResponse.json(
      { error: `Failed to fetch Canvas assignments: ${error.message}` },
      { status: 500 }
    );
  }
} 