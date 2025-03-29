const ACCESS_TOKEN = "22119~aG6TvhtwXXxZeDRN7XZAxKu22vNPLFt9FA4teL4XaD9w6AXXHnA4WeAJR6kD6T8Z";
const API_BASE = "https://canvas.its.virginia.edu/api/v1";

// const now = new Date();
// const nextWeek = new Date();
// nextWeek.setDate(now.getDate() + 7);

// Define types
interface Course {
  id: number;
  name: string;
}

interface Assignment {
  name: string;
  due_at: string | null;
}

// Fetch wrapper with auth
async function canvasGET<T>(endpoint: string): Promise<T>
{
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: "application/json",
    },
  });
//   checking response 
  if (!res.ok) throw new Error(`Error ${res.status} on ${endpoint}`);
//   returns json if res acceptable 
  return res.json();
}

(async () => {
  try {
    // getting courses enrolled in 
    const courses = await canvasGET<Course[]>("/courses?enrollment_state=active&per_page=50");
    // create array that will be filled with course assignment is in and due da
    const assignmentsDue: { name: string; course: string; due_at: string }[] = []; 

    for (const course of courses) {
      const assignments = await canvasGET<Assignment[]>(`/courses/${course.id}/assignments?per_page=100`);

      const upcoming = assignments
    //   filter out old assignments 
        .map(a => ({
          name: a.name,
          course: course.name,
          due_at: a.due_at!,
        }));

      assignmentsDue.push(...upcoming);
    }

    //  make into JSON string
    const jsonInfo = JSON.stringify(assignmentsDue, null, 2); //add a lil spacing
    // print the json 
    console.log(jsonInfo);

  } catch (err: any) {
    console.error("Failed to fetch:", err.message);
  }
}
)
();
