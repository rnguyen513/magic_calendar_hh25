import { API_BASE, fetchCanvasAssignments, CanvasAssignmentBasic } from '../../courseInfoToAi';

// Use environment variable for ACCESS_TOKEN
const ACCESS_TOKEN = process.env.CANVAS_ACCESS_TOKEN || "";

// Log important initialization values to help debug
console.log('Canvas Processor Initialized');
console.log('API_BASE:', API_BASE);
console.log('ACCESS_TOKEN present:', ACCESS_TOKEN ? 'Yes (length: ' + ACCESS_TOKEN.length + ')' : 'No');

// Define types for Canvas data
export interface CanvasCourse {
  id: number;
  name: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  due_at: string | null;
  created_at: string | null;
  points_possible: number;
  course_id: number;
  description: string;
}

export interface ProcessedAssignment {
  id: number;
  name: string;
  course: string;
  course_id?: number;
  due_at: string | null;
  created_at: string | null;
  points_possible: number;
  description: string;
  daysUntilDue: number | null;
  // These will be filled by AI
  priority?: 'high' | 'medium' | 'low';
  aiNotes?: string;
}

// Interface for Canvas API response
interface CanvasAssignmentResponse {
  id: number;
  name: string;
  course: string;
  course_id?: number;
  due_at: string | null;
  created_at: string | null;
  points_possible: number;
  description?: string;
}

// Fetch wrapper with auth - now used as a backup only
async function canvasGET<T>(endpoint: string): Promise<T> {
  console.log('Fetching Canvas endpoint:', endpoint);

  // Check if we're running on client-side
  const isClient = typeof window !== 'undefined';
  
  if (isClient) {
    console.log('Running on client-side, using API route proxy');
    // On client side, we need to use the API route to proxy the request
    try {
      const response = await fetch(`/api/canvas${endpoint}`);
      if (!response.ok) {
        console.error(`API route error: ${response.status}`);
        throw new Error(`Error ${response.status} on ${endpoint}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error using API route proxy:', error);
      throw error;
    }
  } else {
    // Server-side fetch with direct Canvas API access
    console.log('Running on server-side, directly fetching Canvas API');
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          Accept: "application/json",
        },
      });
      
      if (!res.ok) {
        console.error(`Canvas API error: ${res.status}`);
        throw new Error(`Error ${res.status} on ${endpoint}`);
      }
      return res.json();
    } catch (error) {
      console.error('Error fetching Canvas API directly:', error);
      throw error;
    }
  }
}

/**
 * Calculate days until due
 * @param dueDate Due date string from Canvas
 * @returns Number of days until due, null if no due date
 */
export function calculateDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get active courses from Canvas
 */
export async function getActiveCourses(): Promise<CanvasCourse[]> {
  console.log('Getting active courses');
  try {
    const courses = await canvasGET<CanvasCourse[]>("/courses?enrollment_state=active&per_page=50");
    console.log(`Found ${courses.length} active courses`);
    return courses;
  } catch (error) {
    console.error('Error getting active courses:', error);
    throw error;
  }
}

/**
 * Get assignments for a specific course
 */
export async function getCourseAssignments(courseId: number): Promise<CanvasAssignment[]> {
  console.log(`Getting assignments for course ID: ${courseId}`);
  try {
    const assignments = await canvasGET<CanvasAssignment[]>(`/courses/${courseId}/assignments?per_page=100`);
    console.log(`Found ${assignments.length} assignments for course ID: ${courseId}`);
    return assignments;
  } catch (error) {
    console.error(`Error getting assignments for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Get all upcoming assignments from all active courses
 * This is the main function that should be used by other modules
 */
export async function getAllUpcomingAssignments(): Promise<ProcessedAssignment[]> {
  console.log('Getting all upcoming assignments...');
  
  // Check if we're running on client-side
  const isClient = typeof window !== 'undefined';
  
  try {
    let canvasAssignments: CanvasAssignmentResponse[];
    
    if (isClient) {
      console.log('Fetching assignments via API route...');
      // On client side, use the API route directly
      const response = await fetch('/api/canvas/assignments');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from API route: ${response.status} ${response.statusText}`);
      }
      
      canvasAssignments = await response.json();
    } else {
      console.log('Fetching assignments via server-side code...');
      // On server side, use the existing function
      canvasAssignments = await fetchCanvasAssignments();
    }
    
    console.log(`Fetched ${canvasAssignments.length} Canvas assignments`);
    
    // Convert Canvas assignments to our ProcessedAssignment format
    const processedAssignments: ProcessedAssignment[] = canvasAssignments
      .filter(assignment => {
        if (!assignment.due_at) return false;
        const isDueInFuture = new Date(assignment.due_at) > new Date();
        return isDueInFuture;
      })
      .map(assignment => ({
        id: assignment.id,
        name: assignment.name,
        course: assignment.course,
        course_id: assignment.course_id || 0,
        due_at: assignment.due_at,
        created_at: assignment.created_at,
        points_possible: assignment.points_possible,
        description: assignment.description || '',
        daysUntilDue: calculateDaysUntilDue(assignment.due_at)
      }));
    
    // Sort by due date (earliest first)
    const sortedAssignments = processedAssignments.sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });
    
    console.log(`Returning ${sortedAssignments.length} processed assignments`);
    return sortedAssignments;
    
  } catch (err: any) {
    console.error("Failed to fetch assignments:", err);
    throw new Error(`Failed to fetch Canvas assignments: ${err.message}`);
  }
} 