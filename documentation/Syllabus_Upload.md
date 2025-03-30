# Syllabus Upload Feature Documentation

## Overview

The Syllabus Upload feature allows users to upload a syllabus PDF, which is then processed using AI to extract important academic events such as exams, assignments, and deadlines. These events are automatically added to the user's calendar with appropriate dates, making academic planning more efficient.

## Components and Flow

### Key Components

1. **`SyllabusUploadModal`** - Modal dialog that handles the initial upload and processing of syllabus PDFs
2. **`SyllabusViewerModal`** - Modal dialog that displays previously uploaded syllabi and provides options to download or replace them
3. **`SyllabusModalContent`** - Wrapper component that determines whether to show the upload or viewer modal based on whether a syllabus exists
4. **`Page`** - Main page component that includes the syllabus button and integrates with the scheduler

### Data Flow

1. User clicks the "Syllabus" button in the bottom-right corner of the app
2. The app checks if a syllabus already exists in local storage:
   - If none exists, the `SyllabusUploadModal` is shown
   - If one exists, the `SyllabusViewerModal` is shown
3. For new uploads, the user selects a PDF file which is:
   - Validated (PDF format, file size)
   - Encoded as base64
   - Sent to the server for AI processing
4. The server processes the PDF using Gemini AI to extract events with dates
5. Extracted events are converted to calendar events with proper date formatting
6. Events are added to the calendar and the syllabus PDF is saved to local storage
7. For viewing an existing syllabus, the user can:
   - View the PDF in the embedded viewer
   - Download the PDF
   - Replace the syllabus with a new one

## Technical Implementation

### Date Handling

One of the key challenges was ensuring that events appeared on the correct day. We implemented several solutions:

1. **Enhanced Date Parser**
   - Created a robust date parser function `parseExactDate` that handles various date formats:
     - ISO format dates (e.g., "2024-04-16T15:30:00")
     - Date strings with month names (e.g., "Apr 16", "April 16")
     - Dates with weekday prefixes (e.g., "Wed, Apr 16")
   - Standardized all event times to 12:00 PM (noon) to prevent duplicate events

2. **Standardized Event Duration**
   - Set event end times to 1:00 PM (13:00) to give each event a standard 1-hour duration
   - This ensures events are displayed correctly in the calendar without spanning to the next day

3. **Consistent Approach Across Components**
   - Applied the same date standardization approach in both initial uploads and syllabus replacements

### PDF Storage and Retrieval

1. **Storage**
   - Syllabus PDFs are stored in the browser's localStorage
   - The PDF content is stored as base64 data
   - Metadata about the syllabus (filename, upload date) is stored separately

2. **Retrieval**
   - When viewing a syllabus, the PDF is retrieved from localStorage
   - The PDF is displayed in an iframe with proper content-type headers

### AI Processing

1. **Text Extraction**
   - The PDF is sent to the server as base64-encoded data
   - The server extracts text content from the PDF

2. **Event Extraction**
   - Gemini AI processes the PDF text with a prompt to identify academic events
   - The AI extracts structured data including event titles, categories, dates, and priorities

3. **Schema Validation**
   - Extracted data is validated against a predefined schema using Zod
   - This ensures all necessary event properties are present and correctly formatted

## UI Improvements

We made several improvements to enhance user experience:

1. **Button Text**
   - Simplified the button text from "View Syllabus" to just "Syllabus" when a syllabus exists
   - Used "Upload Syllabus" when no syllabus exists

2. **Removed Auto-Popup**
   - Eliminated the automatic syllabus modal popup when the website loads
   - Users now explicitly choose when to interact with the syllabus feature

3. **Cleaned Up Modal UI**
   - Removed duplicate close buttons in the modal interface
   - Created a custom DialogContent component without the built-in close button

4. **Progress Indicators**
   - Added progress indicators during syllabus processing
   - Real-time feedback on the number of events found

## Issues Resolved

1. **Calendar Display Issues**
   - Fixed issues where events were appearing on the wrong day due to timezone handling
   - Resolved duplication where events were appearing on both their actual day and the following day

2. **Syllabus Replacement Flow**
   - Ensured events are correctly added to the calendar when replacing an existing syllabus
   - Implemented proper event handling in the SyllabusViewerModal

3. **UI Duplication**
   - Removed duplicate close buttons in the modal interface
   - Ensured consistent UI across all syllabus-related components

## Future Improvements

Potential areas for future enhancement:

1. **Event Categories**
   - Add color-coding for different types of events (exams, assignments, readings)
   - Implement filtering by event category

2. **Recurring Events**
   - Better support for recurring events like weekly lectures or office hours

3. **Cloud Storage**
   - Move from localStorage to cloud storage to ensure syllabus data persists across devices

4. **Multi-Syllabus Support**
   - Allow users to upload and manage multiple syllabi for different courses

## Code Structure

### Main Components

- `components/schedule/_modals/syllabus-upload-modal.tsx` - Handles syllabus upload and processing
- `components/schedule/_modals/syllabus-viewer-modal.tsx` - Displays saved syllabi and allows replacement
- `app/(chat)/page.tsx` - Contains the main page structure and the syllabus button
- `lib/services/syllabus-parser-service.ts` - Contains utility functions for processing syllabi

### API Routes

- `app/api/syllabus/process/route.ts` - Server endpoint that processes syllabi using Gemini AI

### Key Functions

- `parseExactDate()` - Enhanced date parser that handles various date formats
- `syllabusEventsToCalendarEvents()` - Converts AI-extracted events to calendar events
- `handleSyllabusProcessed()` - Processes events extracted from syllabi and adds them to the calendar
- `saveSyllabusPDF()` and `getSyllabusPDF()` - Handle PDF storage and retrieval 