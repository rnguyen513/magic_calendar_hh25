"use client"

// import Calendar from "@/components/custom/calendar";
import { useEffect, useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";

import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";

import SchedulePage from "../schedule/page";
import { SchedulerProvider, useScheduler } from '@/providers/schedular-provider';
import { CalendarLoader } from '@/components/schedule/calendar-loader';
import { SyllabusLoader } from '@/components/schedule/syllabus-loader';
import SchedulerView from '@/components/schedule/_components/view/schedular-view';
import TaskList from "@/components/custom/task-list";
import { SyllabusUploadModal } from "@/components/schedule/_modals/syllabus-upload-modal";
import { SyllabusViewerModal } from "@/components/schedule/_modals/syllabus-viewer-modal";
import { toast } from "sonner";
import { hasSyllabusPDF } from "@/lib/services/syllabus-parser-service";

export default function Page() {

    const [openChat, setOpenChat] = useState(false)
    const [openSyllabusModal, setOpenSyllabusModal] = useState(false)
    const [syllabusExists, setSyllabusExists] = useState(false)
    const id = generateUUID();
    
    // Check if syllabus exists on component mount and when modal closes
    useEffect(() => {
        const checkSyllabus = () => {
            const exists = hasSyllabusPDF();
            setSyllabusExists(exists);
        };
        
        checkSyllabus();
        
        // Also check when modal closes
        if (!openSyllabusModal) {
            checkSyllabus();
        }
    }, [openSyllabusModal]);

    useEffect(() => {
        // Disable scrolling on mount
        document.body.style.overflow = "hidden";
        return () => {
            // Re-enable scrolling when the component unmounts
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div className="flex flex-row h-screen overflow-hidden">
            <SchedulerProvider>
                <CalendarLoader/>

                {/* Task List Section */}
                <TaskList/>

                {/* Calendar Section */}
                <div className="w-2/3 p-6 overflow-hidden">
                    <SchedulerView/>
                </div>

                {/*chat overlay*/}
                <div className="absolute right-5 bottom-5 z-50">
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg px-6 py-3 text-base hover:scale-105 hover:brightness-110 transition-all duration-200"
                            onClick={() => setOpenChat(true)}
                        >
                            Start New Chat
                        </button>
                        <button
                            onClick={() => setOpenSyllabusModal(true)}
                            className="ml-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg px-6 py-3 text-base hover:scale-105 hover:brightness-110 transition-all duration-200"
                        >
                            {syllabusExists ? "Syllabus" : "Upload Syllabus"}
                        </button>
                    </div>
                </div>

                {/* Syllabus Upload Modal */}
                <SyllabusModalContent 
                    isOpen={openSyllabusModal}
                    onClose={() => setOpenSyllabusModal(false)}
                />

                {openChat && (
                    <AlertDialog open={openChat} onOpenChange={(isOpen) => setOpenChat(isOpen)}>
                        <AlertDialogContent className="mx-auto max-w-[95vw] max-h-[95vh] w-full h-full overflow-hidden rounded-lg shadow-lg bg-white p-4 flex flex-col">
                            <AlertDialogHeader>
                                <AlertDialogTitle>New Chat</AlertDialogTitle>
                            </AlertDialogHeader>

                            {/* Chat UI Section - Full Height */}
                            <div className="flex-grow overflow-hidden">
                                <Chat key={id} id={id} initialMessages={[]} />
                            </div>

                            <AlertDialogFooter className="flex justify-end p-2">
                                <AlertDialogCancel
                                    onClick={() => setOpenChat(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                                >
                                    Close Chat
                                </AlertDialogCancel>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </SchedulerProvider>

        </div>
    );
}

// Create a child component to use the hooks within the SchedulerProvider context
function SyllabusModalContent({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    // Now this hook is used inside a component that's a child of SchedulerProvider
    const { handlers } = useScheduler();
    const [viewMode, setViewMode] = useState<'upload' | 'view'>('upload');
    
    // Check if we have a syllabus already
    useEffect(() => {
        if (isOpen) {
            const hasSyllabus = hasSyllabusPDF();
            setViewMode(hasSyllabus ? 'view' : 'upload');
        }
    }, [isOpen]);
    
    // Handle syllabus processing result
    const handleSyllabusProcessed = (events: any[]) => {
        console.log("========= SYLLABUS EVENT PROCESSING DEBUGGING =========");
        console.log(`Processing ${events.length} syllabus events...`);
        if (!events || events.length === 0) return;
        
        // Extract a list of all event dates from the PDF image
        console.log("Expected dates from syllabus image (for cross-checking):");
        console.log("- Midterm Exam #1: Wed, Feb 12 - Should become Feb 12, not Feb 11");
        console.log("- Midterm Exam #2: Wed, Mar 26 - Should become Mar 26, not Mar 25");
        console.log("- Midterm Exam #3: Wed, Apr 16 - Should become Apr 16, not Apr 15");
        console.log("- Final Exam: Sat, May 3 - Should become May 3, not May 2");
        
        // Add events to the calendar
        events.forEach((event: any, index) => {
            console.log(`\nProcessing event ${index + 1}: "${event.title}"`);
            
            // Extract the date parts for detailed debugging
            const startOriginal = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
            const endOriginal = event.endDate instanceof Date ? event.endDate : new Date(event.endDate);
            
            console.log("Original Date Info:");
            console.log(`  Start Date: ${startOriginal.toString()}`);
            console.log(`  Start Date Components: Year=${startOriginal.getFullYear()}, Month=${startOriginal.getMonth()+1}, Day=${startOriginal.getDate()}`);
            console.log(`  Start Date Local String: ${startOriginal.toLocaleString()}`);
            console.log(`  End Date: ${endOriginal.toString()}`);
            console.log(`  End Date Components: Year=${endOriginal.getFullYear()}, Month=${endOriginal.getMonth()+1}, Day=${endOriginal.getDate()}`);
            console.log(`  End Date Local String: ${endOriginal.toLocaleString()}`);
            
            // Alternative date creation approach for cross-checking
            const altStartDate = new Date(
                startOriginal.getFullYear(),
                startOriginal.getMonth(),
                startOriginal.getDate(),
                12, 0, 0
            );
            console.log("Alternative date creation approach:");
            console.log(`  Alt Start Date: ${altStartDate.toString()}`);
            console.log(`  Alt Start Local: ${altStartDate.toLocaleString()}`);
            
            // Add the event to the calendar
            handlers.handleAddEvent({
                ...event,
                // Ensure dates are proper Date objects, but standardize to noon to prevent duplication
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
            
            console.log(`Added event: ${event.title} to calendar`);
        });
        
        console.log("========= END SYLLABUS EVENT PROCESSING DEBUGGING =========");
        
        toast.success(`Added ${events.length} events to your calendar`);
        
        // Close the modal after a short delay
        setTimeout(() => {
            onClose();
        }, 1000);
    };
    
    return (
        <>
            {viewMode === 'upload' ? (
                <SyllabusUploadModal 
                    isOpen={isOpen} 
                    onClose={onClose} 
                    onSyllabusProcessed={handleSyllabusProcessed}
                />
            ) : (
                <SyllabusViewerModal 
                    isOpen={isOpen} 
                    onClose={onClose}
                />
            )}
        </>
    );
}