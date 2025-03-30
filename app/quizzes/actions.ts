"use server";

// Instead of using the Google API which requires a valid API key,
// create a simple function that generates a title based on the filename
export const generateQuizTitle = async (file: string) => {
  try {
    // Extract title from filename (remove extension)
    const baseName = file.split('.').slice(0, -1).join('.');
    
    // Clean up the title
    let title = baseName
      .replace(/[_-]/g, ' ')  // Replace underscores and hyphens with spaces
      .replace(/\s+/g, ' ')   // Replace multiple spaces with a single space
      .trim();
      
    // Capitalize first letter of each word
    title = title.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    // If the title is empty or too long, provide a default
    if (!title || title.length < 2) {
      return "Quiz";
    }
    
    // Limit to 3 words if there are more
    const words = title.split(' ');
    if (words.length > 3) {
      title = words.slice(0, 3).join(' ');
    }
    
    return title;
  } catch (error) {
    console.error("Error generating title:", error);
    return "Quiz";
  }
}; 