# Canvas Integration Flow

This document explains the architecture and data flow for integrating Canvas assignments with the calendar application.

## Overview

The Canvas integration process follows these key steps:

1. **Fetch Canvas Assignments**: Get assignment data from the Canvas API
2. **Process with Gemini AI**: Use AI to prioritize assignments
3. **Convert to Calendar Events**: Transform assignments into calendar events
4. **Display in Calendar**: Add events to the scheduler

## Core Files and Their Roles

### 1. Data Fetching

- **`lib/canvas/calendar-processor.ts`**
  - Handles communicating with the Canvas API
  - Processes raw Canvas data into a standardized format
  - Provides the `getAllUpcomingAssignments()` function that fetches assignments
  - Dynamically detects client/server environment and uses appropriate API methods

### 2. AI Integration

- **`lib/ai/gemini-calendar.ts`**
  - Connects to Google's Gemini AI model
  - Creates prompts for assignment prioritization
  - Provides `getPrioritizedAssignments()` function
  - Includes fallback logic when AI service isn't available
  - Adds priority levels (high/medium/low) to assignments

### 3. Calendar Conversion

- **`lib/canvas/canvas-calendar-integration.ts`**
  - Orchestrates the entire fetch → AI → calendar flow
  - Transforms prioritized assignments into calendar-compatible events
  - Sets proper event times, with the due date as the end time
  - Formats event details including course, points, AI notes, etc.
  - Provides color coding based on priority level

### 4. Calendar Display

- **`components/schedule/calendar-loader.tsx`**
  - Silent component that handles automatic loading
  - Uses the SchedulerProvider context to add events to the calendar
  - Prevents duplicate loading of assignments
  - Handles error cases gracefully

- **`app/schedule/page.tsx`**
  - Main page component that renders the calendar
  - Sets up the SchedulerProvider context
  - Includes the CalendarLoader to fetch Canvas data

## Data Flow Sequence

1. When `app/schedule/page.tsx` loads, it renders the `SchedulerProvider` and `CalendarLoader`
2. The `CalendarLoader` calls `fetchAndProcessCanvasAssignments()` from `canvas-calendar-integration.ts`
3. This function calls `getAllUpcomingAssignments()` to fetch Canvas data
4. It then passes the assignments to `getPrioritizedAssignments()` for AI processing
5. The prioritized assignments are converted to calendar events with `assignmentsToCalendarEvents()`
6. The events are added to the scheduler using `handlers.handleAddEvent()`
7. The calendar view automatically updates to show the new events

## API Structure

### Canvas API

- Uses the Canvas LMS API to fetch active courses and their assignments
- Proxies API requests through a Next.js API route on the client-side for security
- Makes direct API calls on the server-side when possible

### Gemini AI API

- Uses Google's Generative AI SDK to connect to Gemini models
- Sends assignment data in a structured prompt
- Processes AI response to extract priority levels and notes
- Includes fallback prioritization logic based on due dates and points

## Security Considerations

- Canvas API token is stored in `.env.local` and never exposed to the client
- The API route `/api/canvas/assignments` securely proxies Canvas API requests
- AI communication occurs server-side, keeping the API key secure

## Assignment Display

Canvas assignments appear in the calendar with:

- Due date as the end time
- Color coding based on priority (red=high, orange=medium, green=low)
- Detailed information when clicked, including:
  - Course name
  - Points possible
  - Priority level
  - AI-generated notes
  - Assignment description excerpt

This seamless integration ensures students can easily see their upcoming assignments in a calendar format. 