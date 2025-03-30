import { useScheduler } from "@/providers/schedular-provider";
import { useState, useEffect } from "react";

const variantClasses = {
    success: "bg-green-200/40", // Lightened green with lower opacity
    primary: "bg-blue-200/40", // Lightened blue with lower opacity
    default: "bg-gray-300/40", // Neutral gray with lowered opacity
    warning: "bg-yellow-200/40", // Lightened yellow with lowered opacity
    danger: "bg-red-200/40" // Lightened red with lowered opacity
};

const TaskList = () => {
  const { events } = useScheduler();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only stop loading once events are properly fetched (not undefined)
    if (events[0]) {
      setIsLoading(false);
    }
  }, [events]);

  return (
    <div className="w-1/3 min-w-[280px] p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-screen overflow-auto relative">
      {/* Floating Label Header */}
      <div className="bg-white dark:bg-gray-900 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">
        Your Tasks
      </div>
      <div className="border-b border-gray-300 dark:border-gray-700 mb-4 mt-1"></div>

      <div className="mb-20">
        {isLoading ? (
          // Skeleton Loader (Placeholder for Loading)
          <ul className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <li key={index} className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 w-3/4 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 w-1/2 rounded"></div>
              </li>
            ))}
          </ul>
        ) : events.length === 0 ? (
          // Show only after confirming there are no tasks
          <p className="text-gray-500 text-center py-6">No tasks available</p>
        ) : (
          // Display tasks
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className={`p-4 ${variantClasses[event.variant ?? "default"]} dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition`}>
                <strong className="text-gray-900 dark:text-gray-100">{event.title}</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(event.endDate).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskList;
