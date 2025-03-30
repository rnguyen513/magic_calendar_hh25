# Canvas Integration Changes

This document outlines the changes made to integrate Canvas assignments with the Mina Scheduler calendar application, and provides guidance on how to use these new features.

## Overview of Changes

1. **Canvas API Integration**
   - Added the ability to fetch assignment data from Canvas LMS
   - Created data processing logic to transform Canvas assignments into calendar events
   - Implemented AI-powered prioritization using the Gemini model

2. **UI Updates**
   - Updated the Schedule page to display Canvas assignments with priority indicators
   - Added error handling and loading states for better user experience
   - Improved the visual hierarchy of assignments to highlight important details

3. **Package Additions**
   - Added `@google/generative-ai` for AI-powered prioritization
   - Configured test scripts to verify API connectivity

## How to Use

### Setup

1. Copy `.env.example` to `.env.local` and add your Canvas API token:
   ```
   CANVAS_ACCESS_TOKEN=your_canvas_api_token_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   ```

2. Install dependencies using pnpm:
   ```
   pnpm install
   ```

3. Run the application:
   ```
   pnpm dev
   ```

### Features

#### Canvas Assignment Fetching
The application now automatically fetches your Canvas assignments and displays them on the Schedule page. Assignments are filtered to show only upcoming ones.

#### AI Prioritization
The Gemini AI model analyzes your assignments based on:
- Due dates (more urgent = higher priority)
- Point values (higher points = higher priority)
- Estimated effort based on description

Each assignment is categorized as **High**, **Medium**, or **Low** priority, with accompanying AI-generated notes explaining the prioritization reasoning.

### Testing

You can test the Gemini AI integration by running:
```
pnpm test:gemini
```

This will verify that your API key is working correctly and that the application can communicate with the Gemini API.

## File Structure

The key files involved in the Canvas integration are:

- `lib/canvas/calendar-processor.ts` - Processes Canvas assignment data
- `lib/ai/gemini-calendar.ts` - Handles AI prioritization of assignments
- `app/schedule/page.tsx` - Displays the assignments with prioritization
- `app/api/canvas/assignments/route.ts` - API route for fetching Canvas assignments
- `scripts/test-gemini.ts` - Tests the Gemini API connection

## Troubleshooting

### Missing Assignments
If your assignments are not showing up:
1. Verify your Canvas API token is correct
2. Check that your assignments have future due dates
3. Look for error messages on the Schedule page

### "Failed to fetch Canvas assignments" Error
If you see this error:
1. Ensure your Canvas API token is set in `.env.local`
2. Check that the token has the correct permissions
3. Verify the Canvas API is accessible from your network
4. Clear your browser cache and refresh

The application now has a dedicated API route (`/api/canvas/assignments`) that securely handles Canvas API requests from the client side. This ensures your API token remains secure while still allowing browser-based access to Canvas data.

### AI Prioritization Issues
If AI prioritization is not working:
1. Verify your Gemini API key is correct
2. Run the test script to check API connectivity
3. Check the browser console for any error messages

If the AI prioritization fails, the application will fall back to a simple prioritization system based on due dates and point values.

## Next Steps

Future improvements could include:
- Better handling of recurring events
- Integration with other Canvas features (announcements, discussions)
- More detailed AI analysis of assignment descriptions
- User customization of prioritization criteria 