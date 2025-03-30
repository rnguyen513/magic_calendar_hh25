"use client";

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { experimental_useObject } from 'ai/react';
import { z } from 'zod';
import { syllabusEventsToCalendarEvents, saveSyllabusPDF } from "@/lib/services/syllabus-parser-service";

// Define schema for syllabi data
const syllabusEventSchema = z.object({
  title: z.string(),
  category: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  notes: z.string().optional(),
});

const syllabusSchema = z.object({
  events: z.array(syllabusEventSchema),
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
  instructor: z.string().optional(),
  term: z.string().optional(),
});

interface SyllabusUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyllabusProcessed: (events: any[]) => void;
}

/**
 * Parse a date string correctly ensuring the day is preserved
 * 
 * This helper handles dates in various formats including ones with weekday names
 * like "Wed, Apr 16" which can cause timezone issues
 */
function parseExactDate(dateString: string): Date {
  try {
    console.log(`Parsing date with enhanced parser: "${dateString}"`);
    
    // If it's already in ISO format with time, use standard parsing
    if (dateString.includes('T')) {
      console.log(`ISO format detected in "${dateString}"`);
      return new Date(dateString);
    }
    
    // Special handling for dates like "Wed, Apr 16" or "April 16"
    // Try to extract day, month, and optionally the year
    
    // First, handle dates with written month names (Apr 16, April 16, Wed, Apr 16, etc)
    const monthNamePatterns = [
      // Wednesday, April 16
      /^(?:\w+,\s+)?(\w+)\s+(\d{1,2})(?:,?\s+(\d{4}))?$/i,
      // Apr 16 or Apr. 16
      /^(?:\w+,\s+)?(\w+)\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?$/i,
      // 16 April
      /^(\d{1,2})\s+(\w+)(?:\s+(\d{4}))?$/i,
    ];
    
    const currentYear = new Date().getFullYear();
    
    for (const pattern of monthNamePatterns) {
      const match = dateString.match(pattern);
      if (match) {
        console.log(`Month name pattern matched: ${JSON.stringify(match)}`);
        
        let month: string | number;
        let day: number;
        let year: number = currentYear;
        
        if (pattern.toString().includes('(\\d{1,2})\\s+(\\w+)')) {
          // Pattern for "16 April" format
          day = parseInt(match[1]);
          month = match[2];
          if (match[3]) year = parseInt(match[3]);
        } else {
          // Pattern for "April 16" format
          month = match[1];
          day = parseInt(match[2]);
          if (match[3]) year = parseInt(match[3]);
        }
        
        // Convert month name to number (0-11)
        if (typeof month === 'string') {
          const monthMap: {[key: string]: number} = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'june': 5,
            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
          };
          
          const monthKey = month.toLowerCase().substring(0, 3);
          if (monthMap[monthKey] !== undefined) {
            month = monthMap[monthKey];
          } else {
            console.warn(`Unknown month name: ${month}, falling back to standard parsing`);
            return new Date(dateString);
          }
        }
        
        console.log(`Creating date from components: year=${year}, month=${month}, day=${day}`);
        // Create a date at 12:00 PM (noon) instead of 11:59 PM to prevent duplication in calendar
        const parsedDate = new Date(year, month, day, 12, 0, 0);
        console.log(`Result: ${parsedDate.toString()}`);
        return parsedDate;
      }
    }
    
    // If no match was found, try to parse a date like "2024-04-16"
    const isoStyleMatch = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoStyleMatch) {
      console.log(`ISO style date matched: ${JSON.stringify(isoStyleMatch)}`);
      const year = parseInt(isoStyleMatch[1]);
      const month = parseInt(isoStyleMatch[2]) - 1; // JS months are 0-indexed
      const day = parseInt(isoStyleMatch[3]);
      
      console.log(`Creating date from ISO components: year=${year}, month=${month}, day=${day}`);
      const parsedDate = new Date(year, month, day, 12, 0, 0);
      console.log(`Result: ${parsedDate.toString()}`);
      return parsedDate;
    }
    
    // Fallback to standard Date parsing, but ensure it's at noon
    console.log(`No special patterns matched, falling back to standard parsing for "${dateString}"`);
    const stdDate = new Date(dateString);
    if (!isNaN(stdDate.getTime())) {
      // Keep the date components but set time to 12:00 PM
      const fixedDate = new Date(
        stdDate.getFullYear(),
        stdDate.getMonth(),
        stdDate.getDate(),
        12, 0, 0
      );
      return fixedDate;
    }
    
    // If all parsing methods fail, throw an error to use the fallback
    throw new Error(`Unable to parse date: ${dateString}`);
  } catch (e) {
    console.error(`Date parsing error for "${dateString}":`, e);
    // Return current date as fallback
    return new Date();
  }
}

export function SyllabusUploadModal({ isOpen, onClose, onSyllabusProcessed }: SyllabusUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Use the AI object hook to handle the syllabus processing
  const {
    submit,
    object: partialSyllabusData,
    isLoading,
    error,
  } = experimental_useObject({
    api: '/api/syllabus/process',
    schema: syllabusSchema,
    initialValue: undefined,
    onError: (error) => {
      console.error("Syllabus processing error:", error);
      toast.error("Failed to process syllabus. Please try again with another document.");
      setIsUploading(false);
    },
    onFinish: ({ object }) => {
      console.log("Syllabus processing complete:", object);
      if (!object || !object.events || object.events.length === 0) {
        toast.info('No events were found in the syllabus. The PDF may not contain recognizable dates or events.');
        setIsUploading(false);
        return;
      }
      
      // Save the PDF for later viewing if we have it
      if (selectedFile) {
        encodeFileAsBase64(selectedFile).then(base64File => {
          saveSyllabusPDF(base64File, selectedFile.name);
          console.log("Saved syllabus PDF to localStorage for later viewing");
        }).catch(err => {
          console.error("Failed to encode and save syllabus PDF:", err);
        });
      }
      
      // Process dates and convert to calendar events
      const processedEvents = object.events.map((event: any) => {
        try {
          console.log(`DEBUG - Processing event from Gemini: "${event.title}"`);
          console.log(`  - Original startDate: "${event.startDate}"`);
          console.log(`  - Original endDate: "${event.endDate}"`);
          
          // Use the enhanced date parser for both dates
          let startDate: Date;
          let endDate: Date;
          
          // Parse the start date using the enhanced parser
          if (event.startDate) {
            startDate = parseExactDate(event.startDate);
          } else {
            console.log(`  - No start date provided, using current date`);
            const now = new Date();
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              12, 0, 0
            );
          }
          
          // Parse the end date using the enhanced parser
          if (event.endDate) {
            endDate = parseExactDate(event.endDate);
          } else {
            console.log(`  - No end date provided, using start date`);
            endDate = new Date(startDate.getTime());
          }
          
          // If end date is before start date (parsing error), make it same as start date
          if (endDate < startDate) {
            console.log(`  - End date is before start date, correcting`);
            endDate = new Date(startDate.getTime());
          }
          
          // If dates are the same moment, add 1 hour to end time for visibility
          if (endDate.getTime() === startDate.getTime()) {
            console.log(`  - Start and end times are identical, adding 1 hour to end time`);
            endDate = new Date(endDate.getTime() + 60 * 60 * 1000); // Add 1 hour
          }
          
          // Debug the final dates before returning
          console.log(`DEBUG - Final processed dates for "${event.title}":`);
          console.log(`  - Start date: ${startDate.toString()}`);
          console.log(`  - Start date local: ${startDate.toLocaleString()}`);
          console.log(`  - Start date components: Year=${startDate.getFullYear()}, Month=${startDate.getMonth()+1}, Day=${startDate.getDate()}`);
          console.log(`  - End date: ${endDate.toString()}`);
          console.log(`  - End date local: ${endDate.toLocaleString()}`);
          console.log(`  - End date components: Year=${endDate.getFullYear()}, Month=${endDate.getMonth()+1}, Day=${endDate.getDate()}`);
          
          // Generate a unique ID
          const id = `syllabus-${startDate.getTime()}-${event.title.substring(0, 10).replace(/\s/g, '')}`;
          
          return {
            id,
            title: event.title,
            description: event.title,
            startDate,
            endDate,
            category: event.category,
            priority: event.priority || 'medium',
            notes: event.notes || ''
          };
        } catch (e) {
          console.error("Error processing event date:", e);
          return null;
        }
      }).filter(Boolean);
      
      // Transform to calendar events
      const calendarEvents = syllabusEventsToCalendarEvents(processedEvents as any[]);
      
      // Log the final events being sent to the calendar
      console.log("DEBUG - Calendar events after transformation:");
      calendarEvents.forEach((event, index) => {
        console.log(`Event ${index + 1}: "${event.title}"`);
        console.log(`  - Start date: ${event.startDate.toString()}`);
        console.log(`  - Start date local: ${event.startDate.toLocaleString()}`);
        console.log(`  - End date: ${event.endDate.toString()}`);
        console.log(`  - End date local: ${event.endDate.toLocaleString()}`);
      });

      // Send to parent component
      onSyllabusProcessed(calendarEvents);
      toast.success(`Successfully added ${calendarEvents.length} events from syllabus`);
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
      setIsUploading(false);
    },
  });

  // Log modal state changes
  useEffect(() => {
    console.log("SyllabusUploadModal: isOpen =", isOpen);
  }, [isOpen]);

  // Clear selected file when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    console.log("File selected:", file.name);
    
    // Validate file is a PDF
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds the 5MB limit");
      return;
    }
    
    setSelectedFile(file);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a syllabus PDF first");
      return;
    }

    try {
      console.log("Starting upload process for", selectedFile.name);
      setIsUploading(true);
      
      // Encode file as base64
      const encodedFile = await encodeFileAsBase64(selectedFile);
      console.log("File encoded, sending to API");

      // Submit to the AI processing hook
      submit({ 
        file: {
          name: selectedFile.name,
          type: selectedFile.type,
          data: encodedFile,
        }
      });
    } catch (error: any) {
      console.error('Error processing syllabus:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while processing the syllabus');
      setIsUploading(false);
    }
  };

  const resetFileSelection = () => {
    console.log("Resetting file selection");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate progress based on partial data
  const getProgress = () => {
    // If we have partial data, we're at least at 50%
    if (partialSyllabusData) {
      // If we have events, calculate percentage based on how many we've received
      if (partialSyllabusData.events && partialSyllabusData.events.length > 0) {
        // Assuming a typical syllabus has around 20 events max
        const estimatedProgress = Math.min(90, 50 + (partialSyllabusData.events.length * 2));
        return estimatedProgress;
      }
      return 50; // We have some data but no events yet
    }
    
    // If loading but no data yet, show 25%
    if (isLoading || isUploading) {
      return 25;
    }
    
    return 0;
  };

  console.log("Rendering modal, isOpen =", isOpen);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Upload Syllabus</DialogTitle>
          <DialogDescription className="text-center">
            Upload a syllabus PDF to automatically add important dates to your calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isLoading || isUploading}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{selectedFile.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      resetFileSelection();
                    }}
                    disabled={isLoading || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <>
                <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  Drop your syllabus PDF here or click to browse
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  PDF files only, 5MB max
                </p>
              </>
            )}
          </div>

          {(isLoading || isUploading) && (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {partialSyllabusData?.events ? 
                    `Found ${partialSyllabusData.events.length} events so far...` : 
                    'Processing syllabus...'
                  }
                </span>
                <span className="text-muted-foreground">{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              Error: {error.message || "Failed to process syllabus"}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading || isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isLoading || isUploading}>
              {isLoading || isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing
                </span>
              ) : (
                'Upload & Process'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 