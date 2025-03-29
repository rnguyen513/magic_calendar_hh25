export const ACCESS_TOKEN = process.env.CANVAS_ACCESS_TOKEN || "";
export const API_BASE = "https://canvas.its.virginia.edu/api/v1";

// const now = new Date();
// const nextWeek = new Date();
// nextWeek.setDate(now.getDate() + 7);

// Define types
export interface CanvasCourse {
  id: number;
  name: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  created_at: string | null;
  due_at: string | null;
  points_possible: number;
  course_id: number;
  description: string;
}

export interface CanvasAssignmentBasic {
  name: string;
  course: string;
  created_at: string | null;
  due_at: string;
  id: number;
  points_possible: number;
  description?: string;
}

// Fetch wrapper with auth
export async function canvasGET<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: "application/json",
    },
  });
  // checking response 
  if (!res.ok) throw new Error(`Error ${res.status} on ${endpoint}`);
  // returns json if res acceptable 
  return res.json();
}

// Function to fetch all assignments from Canvas
export async function fetchCanvasAssignments(): Promise<CanvasAssignmentBasic[]> {
  try {
    // getting courses enrolled in 
    const courses = await canvasGET<CanvasCourse[]>("/courses?enrollment_state=active&per_page=50");
    console.log("Fetched Canvas courses:", courses.length);
    
    // create array that will be filled with course assignment is in and due date
    const assignmentsDue: CanvasAssignmentBasic[] = []; 

    for (const course of courses) {
      const assignments = await canvasGET<CanvasAssignment[]>(`/courses/${course.id}/assignments?per_page=100`);
      console.log(`Fetched ${assignments.length} assignments for course: ${course.name}`);

      const upcoming = assignments
        // filter out assignments without due dates
        .filter(a => a.due_at !== null)
        .map(a => ({
          id: a.id,
          name: a.name,
          course: course.name,
          created_at: a.created_at!,
          due_at: a.due_at!,
          points_possible: a.points_possible || 0,
          description: a.description || ''
        }));

      assignmentsDue.push(...upcoming);
    }

    console.log(`Total assignments fetched: ${assignmentsDue.length}`);
    return assignmentsDue;
  } catch (err: any) {
    console.error("Failed to fetch Canvas assignments:", err.message);
    throw err;
  }
}

// For backward compatibility and console logging
(async () => {
  try {
    const assignmentsDue = await fetchCanvasAssignments();
    // make into JSON string
    const jsonInfo = JSON.stringify(assignmentsDue, null, 2); // add a lil spacing
    // print the json 
    console.log(jsonInfo);
  } catch (err: any) {
    console.error("Failed to fetch:", err.message);
  }
})();
