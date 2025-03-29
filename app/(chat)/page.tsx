"use client";

import Calendar from "@/components/custom/calendar";
import { useEffect } from "react";

export default function Page() {
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
            {/* Task List Section */}
            <div className="w-1/3 p-6 border-r border-gray-300 overflow-hidden">
                <h2 className="text-lg font-semibold mb-4">Task List</h2>
            </div>

            {/* Calendar Section */}
            <div className="w-2/3 px-6 overflow-hidden">
                <Calendar />
            </div>
        </div>
    );
}
