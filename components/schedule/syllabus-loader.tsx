"use client";

import { useEffect, useState } from 'react';
import { useScheduler } from '@/providers/schedular-provider';
import { SyllabusUploadModal } from './_modals/syllabus-upload-modal';
import { CalendarEvent } from '@/lib/services/calendar-event-service';

interface SyllabusEvent {
  id: string;
  title: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  variant: 'primary' | 'success' | 'default' | 'warning' | 'danger';
  source: 'syllabus';
}

interface SyllabusLoaderProps {
  debug?: boolean; // Debug prop to force modal to show
}

/**
 * Component that handles syllabus PDF uploads and adds events to the calendar.
 * This component displays a modal after a short delay to allow the user to upload a syllabus.
 */
export function SyllabusLoader({ debug = false }: SyllabusLoaderProps) {
  const { handlers } = useScheduler();
  const [showModal, setShowModal] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Reset session storage on mount for debugging
  useEffect(() => {
    if (debug) {
      console.log("Debug mode enabled, resetting session storage");
      sessionStorage.removeItem('hasShownSyllabusModal');
    }
  }, [debug]);

  // Show the modal after a short delay to avoid competing with Canvas data loading
  useEffect(() => {
    console.log("SyllabusLoader mounted");
    
    // DEBUGGING: Temporarily disable session storage check
    // const hasShownModal = sessionStorage.getItem('hasShownSyllabusModal');
    const hasShownModal = null; // Always show modal during debugging
    
    console.log("Session storage check - hasShownModal:", hasShownModal);
    
    if (!hasShownModal && !hasProcessed) {
      console.log("Setting timer to show modal in 1 second");
      const timer = setTimeout(() => {
        console.log("Timer finished, showing modal");
        setShowModal(true);
        // sessionStorage.setItem('hasShownSyllabusModal', 'true'); // Commented out for debugging
      }, 1000); // Reduced to 1 second for faster debugging
      
      return () => {
        console.log("Cleaning up timer");
        clearTimeout(timer);
      };
    }
  }, [hasProcessed]);

  /**
   * Process the events from the syllabus and add them to the calendar
   */
  const handleSyllabusProcessed = (events: SyllabusEvent[]) => {
    console.log("Processing syllabus events:", events.length);
    if (!events || events.length === 0) return;
    
    // Process each event and add to calendar
    events.forEach(event => {
      handlers.handleAddEvent({
        ...event,
        // Ensure dates are proper Date objects
        startDate: event.startDate instanceof Date ? event.startDate : new Date(event.startDate),
        endDate: event.endDate instanceof Date ? event.endDate : new Date(event.endDate),
      });
    });
    
    setHasProcessed(true);
    console.log("Syllabus events processed and added to calendar");
  };

  // This component doesn't render anything except the modal
  return <SyllabusUploadModal 
    isOpen={showModal} 
    onClose={() => {
      console.log("Modal closed");
      setShowModal(false);
    }} 
    onSyllabusProcessed={handleSyllabusProcessed} 
  />;
} 