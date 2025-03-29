"use client";
import SchedulerWrapper from "@/components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "@/providers/schedular-provider";
import type { Event } from "@/types";

type CalendarProps = {
    events?: Event[] | undefined
}
const Calendar = ({events}:CalendarProps) => {
    return(
        <div className="p-5">
            <SchedulerProvider initialState={events} weekStartsOn="monday">
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

export default Calendar;