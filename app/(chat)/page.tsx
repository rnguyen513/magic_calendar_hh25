"use client";

// import { Chat } from "@/components/custom/chat";
// import { generateUUID } from "@/lib/utils";
import SchedulerWrapper from "@/components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "@/providers/schedular-provider";

export default async function Page() {
//   const id = generateUUID();
//   return <Chat key={id} id={id} initialMessages={[]} />;
    return(
        <div className="p-5">
            <SchedulerProvider weekStartsOn="monday">
            <SchedulerWrapper 
            stopDayEventSummary={true}
            classNames={{
                tabs: {
                panel: "p-0",
                },
            }}
            />
        </SchedulerProvider>
      </div>
    )
}