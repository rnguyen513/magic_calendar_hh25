# Generated Content History Feature

## Overview

This feature allows users to access previously generated content (quizzes and summaries) for documents that have been processed by AI. The implementation follows a minimalistic approach, focusing on enhancing the user experience without major architectural changes.

## Implementation Details

### 1. API Endpoints

We added the following API endpoints:

- **GET `/api/generated-content`**: Fetches all generated content items for a specific document
- **GET `/api/generated-content/[contentId]`**: Fetches a specific generated content item by ID, along with its associated document information

### 2. Components

- **GeneratedContentModal**: A modal component that displays the history of generated content for a document, organized by type (quizzes and summaries)

### 3. Pages

- **`/quizzes/saved/[contentId]`**: Displays a previously generated quiz
- **`/summary/saved/[contentId]`**: Displays a previously generated summary

### 4. UI Changes

- Added a history button to each document card to access previously generated content
- The history button opens a modal showing all quizzes and summaries generated for that document
- Each content item in the modal can be clicked to view the full content

## User Flow

1. User navigates to a folder in the Study Materials section
2. Each document displays a history icon button
3. Clicking the history button shows a modal with all previously generated content for that document
4. User can click on any item to view the full content
5. When viewing content, a "Back" button returns the user to the folder view

## Technical Notes

- Content is stored in JSON format in the database and parsed when needed
- We validate content against schemas to ensure type safety
- The feature leverages existing database queries and schema
- The UI is consistent with the rest of the application

## Future Enhancements

Potential future improvements:
- Ability to delete specific generated content items
- Filtering and searching of generated content
- Comparing different versions of generated content
- Downloading generated content in various formats 