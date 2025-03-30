# Magic Calendar - Final Project Documentation

## Project Overview

Magic Calendar is an AI-powered academic productivity assistant designed to help students manage their coursework efficiently. The platform leverages cutting-edge AI technology to organize tasks, analyze academic documents, generate study materials, and provide a comprehensive scheduling system. The goal of the application is to transform how students approach their academic responsibilities, making organization and learning more efficient.

## Technology Stack

### Core Framework
- **Next.js (App Router)**: The application is built using Next.js with its App Router architecture, providing server-side rendering capabilities, improved performance through React Server Components (RSCs), and efficient routing.
- **React**: The foundation for building the interactive UI components with a component-based architecture.
- **TypeScript**: Used throughout the application for type safety and improved developer experience.

### AI Integration
- **Vercel AI SDK**: Provides a unified API for interacting with various Large Language Models (LLMs).
- **Google Gemini 1.5 Pro**: The primary AI model used for generating content, analyzing documents, and prioritizing tasks.
- **OpenAI Integration**: Alternative LLM support for specific features through the AI SDK's unified interface.

### Data Storage
- **Vercel Postgres (powered by Neon)**: SQL database for storing user data, calendar events, folders, documents, and chat history.
- **Drizzle ORM**: Type-safe database client for interacting with the Postgres database.
- **Vercel Blob Storage**: For storing PDF documents, syllabus files, and other user-uploaded content.
- **Local Storage**: Used for client-side persistence of certain user preferences and the current syllabus.

### Authentication
- **NextAuth.js**: Provides secure authentication with support for multiple providers including:
  - Email/password authentication
  - Google OAuth
  - GitHub OAuth

### User Interface
- **Tailwind CSS**: Utility-first CSS framework for styling the application.
- **shadcn/ui**: Component library built on top of Radix UI providing accessible and customizable UI components.
- **Framer Motion**: For implementing smooth animations and transitions.
- **Sonner**: Toast notification system for providing user feedback.

### Development Tools
- **PNPM**: Package manager used for dependency management.
- **Zod**: Schema validation library for form inputs and API responses.
- **ESLint**: For code quality and consistency.

## Key Features

### 1. AI Calendar and Task Management

The calendar system serves as the core organizational tool in Magic Calendar, allowing students to:

- View and manage assignments, exams, and deadlines in day, week, or month views
- Automatically prioritize tasks based on importance and deadlines using AI
- Add, edit, and delete events with a user-friendly interface
- Integrate with Canvas LMS to import assignments and deadlines automatically
- Color-code events based on their priority or category

The calendar implementation uses a custom scheduler component that provides multiple views and robust event management capabilities. Events can be manipulated programmatically using the `useScheduler` hook, which provides access to event state and manipulation methods.

### 2. Syllabus Upload and Processing

One of the most innovative features is the ability to extract academic events from course syllabi automatically:

- Users can upload syllabus PDF files through a dedicated modal
- The Google Gemini AI processes the PDF text to extract key events like exams, assignments, and deadlines
- Extracted events are automatically added to the calendar with appropriate dates
- Users can view, download, or replace existing syllabi
- The system handles various date formats and ensures correct event placement

This feature required complex date handling to ensure events appeared on the correct day, regardless of timezone differences. The implementation stores syllabus PDFs in localStorage with metadata and provides a viewer for easy reference.

### 3. Study Materials Management

The Study Materials system provides a structured way to organize academic content:

- Folder-based document organization
- PDF upload and storage in Vercel Blob
- Document viewer integration
- Contextual actions for each document (view, generate quiz, generate summary)
- Content history tracking for previously generated materials

The system uses a database schema with Folder and Document tables to track relationships between content. API endpoints handle the creation, retrieval, and deletion of folders and documents.

### 4. AI-Powered Study Tools

Magic Calendar leverages AI to transform uploaded study materials into effective learning tools:

- **Quiz Generation**: Automatically creates interactive quizzes from uploaded PDF documents, testing understanding of key concepts
- **Summary Generation**: Produces concise summaries of complex documents, highlighting the most important information
- **Content History**: Tracks previously generated content for each document, allowing students to revisit past materials

### 5. Canvas LMS Integration

The application integrates with Canvas Learning Management System to automate task management:

- Imports assignments and deadlines directly from Canvas
- Uses Gemini AI to prioritize assignments based on due dates, point values, and complexity
- Converts prioritized assignments into calendar events with appropriate colors and descriptions
- Provides a simple one-click import process

This integration follows a sophisticated workflow where Canvas data is fetched, processed by Gemini AI for prioritization, and then transformed into calendar events.

### 6. Chat Interface

A flexible chat interface allows students to interact with the AI assistant:

- Ask questions about academic content
- Get help with scheduling and organization
- Upload documents for analysis during chat
- Access chat history for reference

## Development Process

### Planning and Architecture

The development began with defining the core features and planning the application architecture. The Next.js App Router structure was chosen for its enhanced performance and server-side rendering capabilities. The team created detailed documentation outlining the main components and their interactions.

### Database Design

A relational database schema was designed using Drizzle ORM, with tables for:
- Users and authentication
- Calendar events
- Folders and documents
- Chat history
- Generated content (quizzes, summaries)

### UI Implementation

The user interface was built using React components styled with Tailwind CSS and shadcn/ui. The design prioritized:
- Clean, intuitive navigation
- Responsive layouts for all device sizes
- Accessible controls and semantic HTML
- Consistent theme and visual language

### Feature Implementation

Each feature was developed incrementally, with a focus on modularity and reusability:

1. **Calendar System**: 
   - Implemented basic event management
   - Added multiple views (day, week, month)
   - Created forms for event manipulation

2. **Syllabus Processing**:
   - Developed the upload interface and PDF handling
   - Integrated Gemini AI for text extraction and event identification
   - Implemented date parsing logic for accurate calendar placement
   - Added syllabus viewer and replacement functions

3. **Study Materials**:
   - Created folder and document management system
   - Implemented file upload with validation
   - Developed document viewer integration
   - Added context menus for document actions

4. **Canvas Integration**:
   - Built Canvas API connection
   - Implemented assignment fetching and processing
   - Added AI-powered prioritization
   - Created event transformation logic

5. **Chat Interface**:
   - Developed real-time chat UI
   - Implemented message history
   - Added file attachment capabilities
   - Created contextual AI responses

### Testing and Refinement

Throughout development, extensive testing was performed to ensure:
- Cross-browser compatibility
- Performance optimization
- Error handling and recovery
- Accurate AI processing results

The syllabus processing feature, in particular, underwent multiple iterations to resolve date handling issues and ensure events appeared on the correct days.

## Results and Achievements

The Magic Calendar application successfully delivers on its promise to help students manage their academic responsibilities more efficiently:

### Technical Achievements

1. **Seamless AI Integration**: Successfully integrated Google Gemini 1.5 Pro for multiple purposes, from document analysis to task prioritization.

2. **Complex Date Handling**: Implemented robust date parsing logic that handles various formats and ensures accurate calendar placement regardless of timezone.

3. **Secure Document Management**: Created a comprehensive system for document storage, retrieval, and processing with appropriate access controls.

4. **Responsive UI**: Developed a fluid, responsive interface that works across devices of all sizes.

### User Benefits

1. **Time Savings**: By automating the extraction of key dates from syllabi and Canvas, students save significant time on manual entry.

2. **Improved Organization**: The folder-based document system and prioritized calendar provide a structured approach to academic planning.

3. **Enhanced Learning**: AI-generated quizzes and summaries offer new ways to interact with academic content and strengthen understanding.

4. **Reduced Stress**: The prioritization system helps students focus on what matters most, reducing the anxiety of managing multiple deadlines.

## Future Improvements

While Magic Calendar already provides robust functionality, several areas have been identified for future enhancement:

1. **Event Categories**: Adding color-coding for different types of events (exams, assignments, readings) and implementing filtering by category.

2. **Recurring Events**: Better support for recurring events like weekly lectures or office hours.

3. **Cloud Synchronization**: Moving from localStorage to cloud storage for syllabi to ensure data persists across devices.

4. **Multi-Syllabus Support**: Allowing users to manage multiple syllabi for different courses.

5. **Enhanced Canvas Integration**: Improving the synchronization between Canvas and the calendar with real-time updates.

6. **Mobile Application**: Developing a dedicated mobile app for improved on-the-go access.

## Conclusion

Magic Calendar represents a significant advancement in academic productivity tools, leveraging the power of AI to transform how students organize and interact with their academic responsibilities. By combining calendar management, document organization, and AI-powered study tools in a single platform, it provides a comprehensive solution to the challenges faced by modern students.

The application demonstrates the potential of integrating Large Language Models into practical, everyday tools that genuinely improve user experiences. Through careful design, robust implementation, and iterative refinement, Magic Calendar delivers a polished, functional system that meets the complex needs of today's students. 