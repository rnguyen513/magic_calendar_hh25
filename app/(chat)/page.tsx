"use client"

import Calendar from "@/components/custom/calendar";
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

export default function Page() {

    const [openChat, setOpenChat] = useState(false)
    const id = generateUUID();

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

            {/*chat overlay*/}
            <div className="absolute right-5 bottom-5 z-50">
                <div className="flex items-center justify-center">
                    <button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg px-6 py-3 text-base hover:scale-105 hover:brightness-110 transition-all duration-200"
                        onClick={() => setOpenChat(true)}
                    >
                        Start New Chat
                    </button>
                </div>
            </div>

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

        </div>
    );
}