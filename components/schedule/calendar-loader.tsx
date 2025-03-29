"use client";

import { useEffect, useState } from 'react';
import { useScheduler } from '@/providers/schedular-provider';
import { fetchAndProcessCanvasAssignments } from '@/lib/canvas/canvas-calendar-integration';

/**
 * Component that loads Canvas assignments into the calendar.
 * This is an invisible component that just handles the data fetching
 * and adds the events to the scheduler context.
 */
export function CalendarLoader() {
  const { handlers } = useScheduler();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadCanvasAssignments = async () => {
      if (loaded) return; // Don't load multiple times
      
      try {
        console.log("Loading Canvas assignments into calendar...");
        
        // Fetch and process Canvas assignments
        const { events } = await fetchAndProcessCanvasAssignments();
        
        if (events.length === 0) {
          console.log("No Canvas assignments to add to calendar");
          return;
        }
        
        console.log(`Adding ${events.length} Canvas assignments to calendar`);
        
        // Add each event to the calendar
        events.forEach(event => {
          handlers.handleAddEvent({
            ...event,
            // Ensure dates are proper Date objects
            startDate: event.startDate instanceof Date ? event.startDate : new Date(event.startDate),
            endDate: event.endDate instanceof Date ? event.endDate : new Date(event.endDate),
          });
        });
        
        console.log("Successfully added Canvas assignments to context");
        setLoaded(true);
      } catch (error) {
        console.error("Error loading Canvas assignments:", error);
      }
    };

    loadCanvasAssignments();
  }, [handlers, loaded]);

  // This component doesn't render anything
  return null;
}