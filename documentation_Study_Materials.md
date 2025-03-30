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

## Study Materials System

### Overview

The Study Materials system is a core component of Magic Calendar that allows users to organize and interact with educational content. It provides a folder-based structure for organizing PDF documents and seamlessly integrates with AI-powered features like quiz and summary generation.

### Key Components

1. **Study Materials Dashboard (`app/study-material/page.tsx`)**
   - Main entry point for the study materials feature
   - Displays a list of user-created folders
   - Provides interface for folder creation and management
   
2. **Folder Detail Page (`app/study-material/folder/[folderId]/page.tsx`)**
   - Displays contents of a specific folder
   - Handles document upload within the folder context
   - Provides interface for document management and AI processing

3. **Document Management APIs**
   - Folder operations (`app/api/folders/route.ts` and `app/api/folders/[folderId]/route.ts`)
   - Document operations (`app/api/documents/[documentId]/route.ts`)
   - Upload handling (`app/api/folders/[folderId]/documents/route.ts`)

4. **Database Layer**
   - Schema definitions in `db/schema.ts` (folder and document tables)
   - Query functions in `db/queries.ts`

### User Flows

#### Folder Management

1. **Creating Folders**
   - From the Study Materials dashboard, users click "Add Folder"
   - Enter a folder name in the modal
   - System creates a new folder entry in the database
   - Implementation: `createFolder` function in `db/queries.ts`

2. **Viewing Folders**
   - Study Materials dashboard fetches and displays all folders for the current user
   - Each folder displays its name and creation date
   - Implementation: `getFoldersByUserId` function in `db/queries.ts`

3. **Opening Folders**
   - Users click on a folder or the "Open Folder" button
   - System navigates to the folder detail page with the specific folder ID
   - Folder detail page loads document list and folder information
   - Implementation: `useRouter().push(/study-material/folder/${folderId})` and `getFolderById` function

4. **Deleting Folders**
   - Users click the delete icon on a folder card
   - System confirms deletion intent
   - If confirmed, folder and all contained documents are deleted
   - Implementation: DELETE request to `/api/folders/[folderId]`

#### Document Management

1. **Uploading Documents**
   - From a folder detail page, users can:
     - Drag and drop PDF files onto the upload area
     - Click to browse and select PDF files
     - System validates files (PDF only, under 5MB)
   - Files are stored in Vercel Blob storage
   - Database entries are created with references to the blob URL
   - Implementation: POST to `/api/folders/[folderId]/documents`

2. **Viewing Documents**
   - Documents are listed in the folder with metadata (name, size, upload date)
   - Users can click "View Document" to open the PDF directly
   - Implementation: Uses the stored blob URL to display the PDF

3. **Document Actions**
   - Each document has a context menu with options:
     - View Document: Opens the PDF in a new tab
     - Generate Quiz: Redirects to the quiz page with document ID
     - Generate Summary: Redirects to the summary page with document ID
     - View History: Shows previously generated content for this document
   - Implementation: Dropdown menu in folder detail page

### Integration with AI Features

1. **Quiz Generation Flow**
   - From folder detail, user selects "Generate Quiz" on a document
   - System navigates to `app/quizzes/page.tsx` with document ID as a parameter
   - Quiz page fetches document information and preserves folder context
   - AI processes the document and generates interactive quiz questions
   - "Try Another PDF" button returns user to the original folder

2. **Summary Generation Flow**
   - From folder detail, user selects "Generate Summary" on a document
   - System navigates to `app/summary/page.tsx` with document ID as a parameter
   - Summary page fetches document information and preserves folder context
   - AI processes the document and generates a comprehensive summary
   - "Try Another PDF" button returns user to the original folder

3. **Content History**
   - Document Content History modal (`components/quizzes_components/generated-content-modal.tsx`)
   - Displays previously generated quizzes and summaries for a document
   - Allows users to revisit past AI-generated content

### Technical Implementation

#### Database Schema

The Study Materials system uses two primary tables:

1. **Folder Table**:
   ```typescript
   export const folder = pgTable("Folder", {
     id: text("id").primaryKey().defaultRandom(),
     folderName: text("folderName").notNull(),
     userId: text("userId").notNull(),
     createdAt: timestamp("createdAt").defaultNow(),
   });
   ```

2. **Document Table**:
   ```typescript
   export const document = pgTable("Document", {
     id: text("id").primaryKey().defaultRandom(),
     fileName: text("fileName").notNull(),
     fileType: text("fileType").notNull(),
     fileSize: text("fileSize").notNull(),
     blobUrl: text("blobUrl").notNull(),
     folderId: text("folderId")
       .references(() => folder.id)
       .notNull(),
     userId: text("userId").notNull(),
     createdAt: timestamp("createdAt").defaultNow(),
   });
   ```

#### API Implementation

1. **Folder API Endpoints**:
   - `GET /api/folders` - List all folders for the current user
   - `POST /api/folders` - Create a new folder
   - `GET /api/folders/[folderId]` - Get a specific folder details
   - `DELETE /api/folders/[folderId]` - Delete a folder and its contents

2. **Document API Endpoints**:
   - `POST /api/folders/[folderId]/documents` - Upload a document to a folder
   - `GET /api/documents/[documentId]` - Get document details
   - `DELETE /api/documents/[documentId]` - Delete a specific document

3. **Key Implementation Files**:
   - `app/study-material/page.tsx` - Folder listing and creation
   - `app/study-material/folder/[folderId]/page.tsx` - Folder detail and document upload
   - `app/api/folders/[folderId]/documents/route.ts` - Document upload logic

#### Security Considerations

1. **Authorization**:
   - All API endpoints check for user authentication
   - Folder and document operations verify ownership
   - Example:
     ```typescript
     // Check if the folder belongs to the current user
     if (folder.userId !== session.user.id) {
       return NextResponse.json(
         { error: "You don't have permission to access this folder" },
         { status: 403 }
       );
     }
     ```

2. **Validation**:
   - File uploads are validated for:
     - File type (PDFs only)
     - File size (5MB maximum)
     - Duplicate file names within the same folder

3. **Storage Security**:
   - Uses Vercel Blob for secure file storage
   - Document URLs are associated with user accounts
   - Cross-user access is prevented through authorization checks

### Troubleshooting Common Issues

1. **Folder Deletion**:
   - Issue: Folders with documents cannot be deleted directly due to foreign key constraints
   - Solution: API should first delete all documents in the folder before deleting the folder itself

2. **File Upload Limits**:
   - Issue: Users may try to upload files larger than 5MB
   - Solution: Client-side and server-side validation prevents oversized uploads
   - Error messages inform users of size limitations

3. **Navigation Context**:
   - Issue: After generating quizzes/summaries, users should return to their original folder
   - Solution: Folder ID is preserved and used for navigation to maintain context

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