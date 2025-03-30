# Fixing Duplicate Quiz/Summary Generation Issue

## Problem Description

When a user uploaded a document and generated a quiz or summary, multiple entries were being created in the content history modal. Specifically, when a user viewed the generated content history for a document, they saw duplicate entries for each generation attempt.

## Root Cause Analysis

After investigating the code, we identified several potential issues that could cause duplicate content generation:

1. **No Duplicate Content Check**: The API endpoints for quiz and summary generation were saving the generated content without checking if similar content already existed for the document.

2. **React Component Lifecycle Issues**: State updates and API calls could potentially be triggered multiple times during component mounting/unmounting, especially in development mode where React's strict mode runs effects twice.

3. **Missing Cleanup Functions**: The useEffect hooks that triggered content generation didn't have proper cleanup functions, which could lead to race conditions.

## Implemented Fixes

### 1. Preventing Duplicate Content Storage

We modified the quiz and summary API endpoints to check for existing content before saving:

```typescript
// Check if a quiz already exists for this document
const existingContent = await getGeneratedContentByDocumentId({ documentId });
const existingQuizzes = existingContent.filter(item => item.contentType === 'quiz');

// Only save if there's no existing quiz
if (existingQuizzes.length === 0) {
  await createGeneratedContent({
    contentType: 'quiz',
    content: object,
    documentId,
  });
}
```

This ensures that we only save one quiz or summary per document, preventing duplicate entries.

### 2. Improved Component Lifecycle Management

We added cleanup functions to the useEffect hooks that trigger content generation:

```typescript
useEffect(() => {
  let isActive = true; // Flag to track if component is still mounted
  
  // Effect logic...
  
  // Cleanup function
  return () => {
    isActive = false; // Prevent state updates if component unmounts
  };
}, [dependencies]);
```

This prevents race conditions and ensures that state updates don't occur after a component unmounts.

### 3. Enhanced UI for Content Management

We improved the user interface to make content generation and history viewing more intuitive:

- Added a dropdown menu to document cards with clear options for viewing, generating quizzes/summaries, and accessing history
- Added a refresh button to the content history modal
- Improved error handling and loading states

## How to Verify the Fix

1. Upload a PDF document to a folder
2. Generate a quiz or summary
3. Return to the folder view
4. Click the history button on the document
5. Verify that only one entry appears for the generated content

If you still see duplicate entries, try clicking the refresh button in the history modal. If the issue persists, please report it with details about the specific document and actions taken.

## Technical Notes

- The fix preserves existing functionality while preventing duplicates
- We've maintained the ability to generate both quizzes and summaries for the same document
- The solution is focused on preventing duplicates at the data storage level rather than filtering duplicates in the UI 