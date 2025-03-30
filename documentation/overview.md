# Syllabus Upload Feature

## Overview

The syllabus upload feature allows students to upload course syllabi PDFs and automatically extract important dates and events into the calendar. This feature complements the existing Canvas integration by providing an additional source of events for courses that may not be available in Canvas or for instructors who don't use Canvas extensively.

## Key Components

1. **User Interface**
   - `SyllabusUploadModal`: A modal component that handles file selection, validation, and upload
   - `SyllabusLoader`: A loader component that automatically shows the upload modal when the calendar page loads

2. **Data Processing**
   - `pdf-extractor-service.ts`: Extracts text content from uploaded PDFs
   - `gemini-syllabus.ts`: Uses Gemini AI to analyze syllabus content and identify events
   - `syllabus-parser-service.ts`: Converts AI-processed events into calendar-compatible format

3. **API Endpoint**
   - `/api/syllabus/process`: Handles the full workflow from PDF upload to calendar event generation

## Implementation Details

### Modal Behavior

The syllabus upload modal appears automatically after the calendar page loads (2-second delay), but only once per session. This allows users to upload a syllabus immediately upon accessing the calendar without being intrusive on subsequent visits.

### Event Prioritization

Events extracted from syllabi are prioritized based on their type:
- High priority (red): Exams, quizzes, finals
- Medium priority (orange): Assignments, projects, papers
- Low priority (green): General events, office hours

### Integration with Calendar

Syllabus events are added to the same calendar as Canvas events but are clearly labeled with a "[Syllabus]" prefix. The `source: 'syllabus'` attribute helps distinguish them from other event types in the future.

### Fallback Processing

If the AI-powered extraction fails or is unavailable, a basic regex-based fallback system still attempts to extract dates and events from the syllabus.

## Design Considerations

1. **Separation of Concerns**: The syllabus feature was implemented without modifying the existing Canvas integration.

2. **Shared UI Elements**: Both Canvas and syllabus events use the same calendar provider and event handlers.

3. **Error Handling**: The feature has robust error handling at multiple levels:
   - File validation (PDF type, size limits)
   - PDF extraction error recovery
   - AI processing fallbacks
   - API error responses

4. **User Experience**: Visual progress indicators, toast notifications, and clear error messages create a smooth experience.
