# Magic Calendar - Technical Documentation

## Overview

Magic Calendar is an AI-powered academic productivity assistant designed to help students organize coursework, study materials, and manage their academic responsibilities more efficiently. The application integrates with learning management systems like Canvas to automate task organization while providing AI-powered study tools.

## Key Features

1. **Study Materials Organization**
   - Folder-based document management
   - PDF document upload and storage
   - Document viewer integration

2. **AI Study Tools**
   - Quiz generation from PDF documents
   - Summary generation from PDF documents
   - Direct processing of documents from folders

3. **Canvas Integration**
   - Automatic import of assignments and deadlines
   - Task prioritization based on due dates

## Folder Structure

The application follows Next.js App Router architecture:

```
app/
  ├── study-material/               # Study materials section
  │   ├── page.tsx                  # Main folder listing page
  │   └── folder/[folderId]/        # Individual folder pages with documents
  │
  ├── quizzes/                      # Quiz generation feature
  │   ├── page.tsx                  # PDF upload and quiz display
  │   └── actions.ts                # Server actions for quiz functionality
  │
  ├── summary/                      # Summary generation feature
  │   └── page.tsx                  # PDF upload and summary display
  │
  ├── api/                          # Backend API endpoints
      ├── folders/                  # Folder management
      ├── documents/                # Document management
      ├── quizzes/                  # Quiz generation
      └── summary/                  # Summary generation

components/                         # Reusable UI components
  ├── quizzes_components/          
  └── schedule/                     # Calendar and scheduling components

db/                                 # Database related files
  ├── schema.ts                     # Database schema definitions
  ├── queries.ts                    # Database operations
  └── migrate.ts                    # Migration utilities
```

## Implementation Details

### Folder Management

Folders are created and managed through a RESTful API:

1. **Creation**: 
   - POST to `/api/folders` with folder name
   - Database entry created with user association

2. **Document Upload**:
   - Files are uploaded to a specific folder via `/api/folders/[folderId]/documents`
   - Files are validated (PDF only, max 5MB)
   - Storage uses Vercel Blob with database references

3. **Folder Viewing**:
   - GET to `/api/folders` retrieves all folders for current user
   - Individual folder details via `/api/folders/[folderId]`

### Quiz and Summary Generation

1. **Document Processing**:
   - Documents can be processed from direct upload or from folders (via `documentId`)
   - PDF content is extracted and sent to Google's Gemini Pro AI

2. **User Flow**:
   - Upload PDF → AI processes content → Display results
   - Folder document → Pass document ID → AI processes → Display results

3. **Return Navigation**:
   - "Try Another PDF" button redirects back to original folder if document came from folder
   - Context preservation maintains user's organizational flow

## Known Issues

### Folder Deletion (Currently Not Working)

The application currently has an issue when trying to delete folders that contain documents:

```
Error: update or delete on table "Folder" violates foreign key constraint 
"Document_folderId_Folder_id_fk" on table "Document"
```

**Issue Analysis**:
- Database constraint prevents deleting folders with documents
- Error occurs in `app/study-material/page.tsx` (line ~116)

**Recommended Solution**:
1. Delete all documents in a folder before deleting the folder itself:
   - Get all documents in folder
   - Delete each document from storage and database
   - Then delete the folder record

2. Implementation location:
   - Fix should be applied in `/api/folders/[folderId]/route.ts` (DELETE method)

## Git Workflow Notes

We recently resolved merge conflicts caused by different formatting of commented console logs. The conflicts were primarily in:
- `components/schedule/calendar-loader.tsx`
- `lib/canvas/calendar-processor.ts`

The resolution involved choosing consistent comment formatting while preserving all functionality.

## Next Steps

1. **Fix Folder Deletion**: Implement cascading document deletion when deleting folders
2. **User**: Allow user to see previous quizzes and summaries

## Recent Fixes

### Navigation Fix (Folder Context Preservation)

We resolved an issue where the "Try Another PDF" button was redirecting users to the Study Materials main page instead of back to the original folder they came from:

1. **Issue Details**:
   - When using the "Try Another PDF" button after generating a quiz or summary, users were always redirected to the main Study Materials page
   - This broke the folder context, forcing users to navigate back to their original folder manually

2. **Solution Implemented**:
   - Enhanced document folder ID extraction and preservation in `app/quizzes/page.tsx` and `app/summary/page.tsx`
   - Added an early-load effect to fetch folder information as soon as possible
   - Improved the `clearPDF` function to ensure proper redirection to the specific folder
   - Added debug logging to track folder ID assignment

3. **Technical Implementation**:
   - Added a dedicated useEffect for initial folder information retrieval
   - Enhanced error handling to preserve folder context even during errors
   - Used console logging to verify correct folder ID extraction

### UI Improvement (Document Content History)

We removed the unnecessary refresh icon from the Document Content History modal:

1. **Issue Details**:
   - The Document Content History modal had a redundant refresh icon in the top right corner
   - The functionality was not necessary as content is automatically loaded when the modal opens

2. **Solution Implemented**:
   - Removed the refresh button from the modal header in `components/quizzes_components/generated-content-modal.tsx`
   - Preserved the auto-load functionality when the modal opens
   - Maintained the "Try Again" button for error recovery scenarios

These fixes improve navigation flow and enhance the user interface, making the application more intuitive and reducing unnecessary UI elements.