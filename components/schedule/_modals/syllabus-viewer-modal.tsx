"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent as BaseDialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { getSyllabusPDF } from "@/lib/services/syllabus-parser-service";
import { SyllabusUploadModal } from "@/components/schedule/_modals/syllabus-upload-modal";
import { useScheduler } from '@/providers/schedular-provider';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import React from "react";

// Custom DialogContent without the close button
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* No close button here */}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface SyllabusViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for viewing the previously uploaded syllabus PDF
 */
export function SyllabusViewerModal({ isOpen, onClose }: SyllabusViewerModalProps) {
  const [pdfData, setPdfData] = useState<{ content: string; metadata: any } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Get the scheduler handlers to add events to the calendar
  const { handlers } = useScheduler();
  
  // Load PDF data when modal opens
  useEffect(() => {
    if (isOpen) {
      const data = getSyllabusPDF();
      if (data) {
        setPdfData(data);
      } else {
        toast.error("Could not load the syllabus PDF. It may have been deleted or corrupted.");
        onClose();
      }
    }
  }, [isOpen, onClose]);
  
  // Function to download the PDF
  const handleDownload = () => {
    if (!pdfData) return;
    
    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = pdfData.content;
      link.download = pdfData.metadata.filename || "syllabus.pdf";
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      toast.success("Syllabus PDF downloaded");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Could not download the syllabus PDF");
    }
  };

  // Function to handle syllabus events after processing
  const handleSyllabusProcessed = (events: any[]) => {
    console.log(`Replacing syllabus with ${events.length} events`);
    
    if (!events || events.length === 0) {
      toast.info("No events were found in the new syllabus");
      return;
    }
    
    // Add events to the calendar
    events.forEach((event, index) => {
      console.log(`Processing replacement event ${index + 1}: "${event.title}"`);
      
      // Get original dates for debugging
      const startOriginal = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
      const endOriginal = event.endDate instanceof Date ? event.endDate : new Date(event.endDate);
      
      console.log(`Event: ${event.title}`, {
        startDate: startOriginal.toLocaleString(),
        startComponents: `Year=${startOriginal.getFullYear()}, Month=${startOriginal.getMonth()+1}, Day=${startOriginal.getDate()}`,
        endDate: endOriginal.toLocaleString(),
        endComponents: `Year=${endOriginal.getFullYear()}, Month=${endOriginal.getMonth()+1}, Day=${endOriginal.getDate()}`
      });
      
      // Add the event to the calendar using the same standardization approach
      handlers.handleAddEvent({
        ...event,
        // Standardize to noon to prevent duplication
        startDate: new Date(
          startOriginal.getFullYear(),
          startOriginal.getMonth(),
          startOriginal.getDate(),
          12, 0, 0
        ),
        endDate: new Date(
          endOriginal.getFullYear(),
          endOriginal.getMonth(),
          endOriginal.getDate(),
          13, 0, 0  // Set to 1 PM to ensure 1-hour duration
        ),
      });
    });
    
    toast.success(`Successfully replaced syllabus with ${events.length} events`);
    
    // Close modals after a short delay
    setTimeout(() => {
      setShowUploadModal(false);
      onClose();
    }, 1000);
  };
  
  return (
    <>
      <Dialog open={isOpen && !showUploadModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-center">Course Syllabus</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1"
              >
                Replace Syllabus
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleDownload}
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 w-full overflow-hidden bg-muted/20 rounded-md">
            {pdfData ? (
              <iframe 
                src={pdfData.content} 
                className="w-full h-full border-0"
                title="Syllabus PDF Viewer"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                Loading PDF...
              </div>
            )}
          </div>
          
          {pdfData?.metadata && (
            <div className="text-xs text-muted-foreground mt-2">
              <p>Uploaded: {new Date(pdfData.metadata.uploadedAt).toLocaleString()}</p>
              <p>Filename: {pdfData.metadata.filename}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showUploadModal && (
        <SyllabusUploadModal
          isOpen={true}
          onClose={() => {
            setShowUploadModal(false);
            onClose();
          }}
          onSyllabusProcessed={handleSyllabusProcessed}
        />
      )}
    </>
  );
} 