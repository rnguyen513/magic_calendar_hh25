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

    const courses = await canvasGET<CanvasCourse[]>("/courses?enrollment_state=active&per_page=50");
    console.log("Fetched Canvas courses:", courses.length);

    // Parallel fetch for all assignments
    // promise all calls to fetch for all this data all at the same time instead of one by one 
    const allAssignments = await Promise.all( 


      courses.map(async (course) => {
        // get assignments for each course 
        const assignments = await canvasGET<CanvasAssignment[]>(`/courses/${course.id}/assignments?per_page=100`);
        // record all assignments 
        console.log(`Fetched ${assignments.length} assignments for course: ${course.name}`);

        // filter what we want from the assignments 
        return assignments
          .filter((a) => a.due_at !== null)
          .map((a) => ({
            id: a.id,
            name: a.name,
            course: course.name,
            created_at: a.created_at!,
            due_at: a.due_at!,
            points_possible: a.points_possible || 0,
            description: a.description || "",
          }));
      })
    );
    // instead of multiple instead of assignments have them one into short 
    const flattened = allAssignments.flat();
    console.log(`Total assignments fetched: ${flattened.length}`);
    return flattened;
  } catch (err: any) {
    console.error("Failed to fetch Canvas assignments:", err.message);
    throw err;
  }
}

(async () => {
  try {
    // assignmentsDue will contain all the data we fetched
    const assignmentsDue = await fetchCanvasAssignments();
    // stringify so we can return in json 
    const jsonInfo = JSON.stringify(assignmentsDue, null, 2);
    console.log(jsonInfo);
  } catch (err: any) {
    console.error("Failed to fetch:", err.message);
  }
})();