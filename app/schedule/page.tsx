"use client";

import React, { useState } from 'react';
import { SchedulerProvider } from '@/providers/schedular-provider';
import SchedulerView from '@/components/schedule/_components/view/schedular-view';
import { CalendarLoader } from '@/components/schedule/calendar-loader';

/**
 * Schedule page that displays a calendar with Canvas assignments
 * The CalendarLoader component handles auto-loading Canvas assignments
 */
export default function SchedulePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      
      {/* Wrap the calendar view with the SchedulerProvider */}
      <SchedulerProvider>
        <CalendarLoader/>
        <SchedulerView/>
      </SchedulerProvider>
    </div>
  );
} 