
# How to Use Mina Scheduler Calendar in Your Project

## Overview
Mina Scheduler is a flexible and customizable calendar component for React that allows you to manage and display events in day, week, or month views. It's built with Next.js and integrates with shadcn/ui for a consistent user interface experience.

## Key Features
- **Multiple Views**: Day, Week, and Month views with easy switching
- **Event Management**: Add, update, and delete events with built-in validation
- **Customizable UI**: Easily customize the appearance of the calendar
- **Mobile-Friendly**: Responsive design for all devices
- **Form Validation**: Uses Zod for schema validation
- **Animations**: Smooth transitions using Framer Motion

## Installation

To add the calendar to your project, run:

```bash
npm install mina-scheduler
```

## Basic Implementation

Here's the simplest way to add the calendar to your Next.js application:

```tsx
"use client";

import { SchedulerProvider, SchedularView } from "mina-scheduler";

export default function CalendarPage() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-4 py-8 md:py-10">
      <SchedulerProvider>
        <SchedularView />
      </SchedulerProvider>
    </section>
  );
}
```

This minimal setup gives you a fully functional calendar with the ability to add, edit, and delete events.

## Adding Initial Events

If you want to pre-populate your calendar with events:

```tsx
"use client";

import { SchedulerProvider, SchedularView, Event } from "mina-scheduler";

export default function CalendarPage() {
  // Define initial events
  const initialEvents = [
    {
      id: "1d4c5c73-b5fa-4f67-bb6e-1d5d66cbd57d",
      title: "Team Meeting",
      description: "Weekly team sync",
      startDate: new Date(), // today's date
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // one hour later
      variant: "primary",
    },
  ] as Event[];

  return (
    <section className="flex w-full flex-col items-center justify-center gap-4 py-8 md:py-10">
      <SchedulerProvider initialState={initialEvents} weekStartsOn="monday">
        <SchedularView />
      </SchedulerProvider>
    </section>
  );
}
```

## Customized Implementation

You can customize many aspects of the calendar:

```tsx
"use client";

import { SchedulerProvider, SchedularView } from "mina-scheduler";

export default function CalendarPage() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-4 py-8 md:py-10">
      <SchedulerProvider weekStartsOn="monday">
        <SchedularView
          // Customize which views are available
          views={{ 
            views: ["day", "week", "month"], 
            mobileViews: ["day", "week"] 
          }}
          
          // Customize styles with Tailwind classes
          classNames={{
            buttons: {
              addEvent: "bg-blue-500 hover:bg-blue-600",
              next: "bg-gray-200 hover:bg-gray-300",
              prev: "bg-gray-200 hover:bg-gray-300",
            },
            tabs: {
              panel: "pt-3",
            },
          }}
        />
      </SchedulerProvider>
    </section>
  );
}
```

## Advanced Usage with Event Callbacks

You can add callbacks to track when events are added, updated, or deleted:

```tsx
"use client";

import { SchedulerProvider, SchedularView, Event } from "mina-scheduler";

export default function CalendarPage() {
  // Event handlers
  const handleAddEvent = (event: Event) => {
    console.log("Event added:", event);
    // You could save to a database here
  };

  const handleUpdateEvent = (event: Event) => {
    console.log("Event updated:", event);
    // You could update in a database here
  };

  const handleDeleteEvent = (id: string) => {
    console.log("Event deleted, ID:", id);
    // You could delete from a database here
  };

  return (
    <section className="flex w-full flex-col items-center justify-center gap-4 py-8 md:py-10">
      <SchedulerProvider 
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      >
        <SchedularView />
      </SchedulerProvider>
    </section>
  );
}
```

## Custom Event Form

You can create a custom form for adding events:

```tsx
"use client";

import { SchedulerProvider, SchedularView } from "mina-scheduler";

// Custom form component
const MyCustomForm: React.FC<{ register: any; errors: any }> = ({
  register,
  errors,
}) => (
  <>
    <input
      {...register("title")}
      placeholder="Event Title"
      className={`w-full p-2 border rounded ${errors.title ? "border-red-500" : "border-gray-300"}`}
    />
    {errors.title && (
      <span className="text-red-500 text-sm">{errors.title.message}</span>
    )}

    <textarea
      {...register("description")}
      placeholder="Description"
      className="w-full p-2 mt-2 border border-gray-300 rounded"
    />

    {/* Date picker fields would go here */}
    
    <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded">
      Save Event
    </button>
  </>
);

export default function CalendarPage() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-4 py-8 md:py-10">
      <SchedulerProvider>
        <SchedularView
          CustomComponents={{
            CustomEventModal: {
              CustomAddEventModal: {
                title: "Add New Event",
                CustomForm: MyCustomForm,
              },
            },
          }}
        />
      </SchedulerProvider>
    </section>
  );
}
```

## Programmatically Manipulating Events

You can use the `useScheduler` hook to dynamically manipulate events:

```tsx
"use client";

import { useScheduler } from "mina-scheduler";

const EventManager = () => {
  const { events, dispatch, handlers } = useScheduler();

  const addRandomEvent = () => {
    const newEvent = {
      id: crypto.randomUUID(),
      title: "New Event",
      description: "Description for the new event",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      variant: "success",
    };
    
    handlers.handleAddEvent(newEvent);
    // Or use dispatch directly:
    // dispatch({ type: "ADD_EVENT", payload: newEvent });
  };

  return (
    <div>
      <button 
        onClick={addRandomEvent}
        className="bg-green-500 text-white p-2 rounded"
      >
        Add Random Event
      </button>
      
      <div className="mt-4">
        <h3>Current Events ({events.length})</h3>
        <ul>
          {events.map(event => (
            <li key={event.id}>
              {event.title} - 
              <button 
                onClick={() => handlers.handleDeleteEvent(event.id)}
                className="text-red-500 ml-2"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

## Integration with Your Project

To integrate this calendar with your academic productivity assistant:

1. Install the package in your project
2. Create a new page component for the calendar functionality
3. Use the `SchedulerProvider` to share calendar data across components
4. Consider using the event callbacks to sync with your backend data storage
5. Customize the styling to match your application's design system

This scheduler would be perfect for the "To-Do List & Calendar Automation" feature mentioned in your project overview, allowing students to visualize their assignments, exams, and deadlines in a calendar format.

You can check out the [live demo](https://mina-scheduler.vercel.app/) to see all features in action before implementing.
