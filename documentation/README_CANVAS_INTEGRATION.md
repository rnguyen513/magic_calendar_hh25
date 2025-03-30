# Canvas Calendar Integration with Gemini AI

This document explains the implementation of the Canvas Calendar Integration feature, which allows users to import their assignments from Canvas LMS and add them to the calendar with AI-driven prioritization.

## Architecture Overview

The Canvas Calendar Integration consists of the following components:

1. **Canvas Data Processor** - Fetches and processes assignment data from Canvas
2. **Gemini AI Service** - Prioritizes assignments using Google's Gemini API
3. **Calendar Event Service** - Transforms prioritized assignments into calendar events
4. **API Endpoint** - Handles the processing flow
5. **React Component** - Provides the user interface for integration

## Component Details

### 1. Canvas Data Processor (`lib/canvas/calendar-processor.ts`)

This utility:
- Fetches courses and assignments from Canvas using the Canvas API
- Standardizes assignment data format
- Calculates additional metrics (days until due)
- Filters for upcoming assignments

```typescript
export async function getAllUpcomingAssignments(): Promise<ProcessedAssignment[]> {
  // Fetches all upcoming assignments from Canvas
}
```

### 2. Gemini AI Service (`lib/ai/gemini-calendar.ts`)

This service:
- Builds a prompt for Gemini explaining how to prioritize assignments
- Calls the Gemini API with the assignment data
- Processes the response to extract priority levels and notes
- Includes fallback prioritization if the API call fails

```typescript
export async function getPrioritizedAssignments(
  assignments: ProcessedAssignment[]
): Promise<PrioritizedAssignment[]> {
  // Processes assignments with Gemini AI
}
```

### 3. Calendar Event Service (`lib/services/calendar-event-service.ts`)

This service:
- Transforms prioritized assignments into calendar events
- Maps priority levels to calendar event variants (colors)
- Formats titles and descriptions for calendar display
- Handles edge cases like missing dates

```typescript
export function transformAssignmentsToEvents(
  assignments: PrioritizedAssignment[]
): CalendarEvent[] {
  // Transforms assignments to calendar events
}
```

### 4. API Endpoint (`app/api/calendar-priorities/route.ts`)

The API endpoint:
- Receives assignment data via POST request
- Calls the Gemini AI service to prioritize assignments
- Transforms results into calendar events
- Returns structured data to the client

```typescript
export async function POST(req: NextRequest) {
  // Processes POST requests with assignment data
}
```

### 5. React Component (`components/schedule/canvas-calendar-integration.tsx`)

The component:
- Provides a user interface button to trigger the import
- Fetches assignments from Canvas when clicked
- Sends data to the API for processing
- Adds the resulting events to the calendar
- Shows status messages (loading, success, error)

## Integration with Scheduler

The Canvas Calendar Integration integrates with the existing scheduler:

- It uses the `useScheduler` hook from `@/providers/schedular-provider` to access calendar methods
- Events are added to the calendar using `handlers.handleAddEvent`
- The component is mounted in the sidebar of the `app/schedule/page.tsx` page

## Data Flow

1. User clicks "Import Assignments from Canvas" button
2. Component fetches assignments from Canvas API
3. Assignments are sent to the API endpoint
4. API calls Gemini to prioritize assignments
5. Prioritized assignments are transformed into calendar events
6. Events are added to the calendar
7. User sees success message with count of imported events

## Setup Requirements

To use this feature, you need:

1. A Canvas API token in the `ACCESS_TOKEN` variable in `courseInfoToAi.ts`
2. The Gemini API key in the environment variable `GOOGLE_GENERATIVE_AI_API_KEY`
3. Install the Google Generative AI package using pnpm:

```bash
pnpm add @google/generative-ai
```

> **Important**: This project uses pnpm as its package manager. Do not use npm or yarn for installing packages, as they don't support the workspace protocol used in some dependencies, which will result in errors like `EUNSUPPORTEDPROTOCOL`.

### Setting up the Gemini API Key

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add it to your environment variables:

```bash
# Linux/macOS
export GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Windows
set GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Or add it to your `.env.local` file:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Gemini 2.5 Pro Integration

This implementation uses the latest Gemini 2.5 Pro Experimental model for advanced assignment prioritization. The model analyzes:

- Due dates
- Point values
- Assignment complexity
- Task relationships

This provides more nuanced prioritization than simpler algorithms based only on due dates.

## Future Improvements

Potential improvements include:

1. Adding authentication to secure Canvas API token
2. Improving prioritization with more Canvas metadata (course weights, grade impact)
3. Adding ability to sync calendar events with Canvas updates
4. User preferences for prioritization criteria 