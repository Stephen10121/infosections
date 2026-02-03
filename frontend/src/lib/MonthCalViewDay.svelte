<script lang="ts">
    import { Temporal } from "temporal-polyfill";
    import { cn, dateRangeOverlaps, type EventDBModel } from "./utils";

    let {
        index,
        events,
        day,
        currentDate
    }: {
        index: number,
        events: EventDBModel[],
        day: Temporal.ZonedDateTime,
        currentDate: Temporal.ZonedDateTime
    } = $props();

    let nextDay = $derived(day.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));


    function isSameDay(date1: Temporal.ZonedDateTime, date2: Temporal.ZonedDateTime): boolean {
        return (
            date1.year === date2.year &&
            date1.month === date2.month &&
            date1.day === date2.day
        )
    }


    function getEventsForDate(events: EventDBModel[]): EventDBModel[] {
        return events.filter((event) => {
            return dateRangeOverlaps(day.toInstant().epochMilliseconds, nextDay.toInstant().epochMilliseconds, (new Date(event.startTime)).valueOf(), (new Date(event.endTime)).valueOf())
        })
    }

    let dayEvents = $derived(getEventsForDate(events))
    let isToday = $derived(isSameDay(day, currentDate))
    let currentMonth = $derived(currentDate.month)
    let isCurrentMonth = $derived(day.month === currentMonth)
</script>

<div
    class={cn(
        "min-h-[80px] p-1 border-b border-r relative border-[#333333]",
        !isCurrentMonth && "bg-muted/30 opacity-[.40]",
        index % 7 === 6 && "border-r-0"
    )}
>
    <div
    class={cn(
        "text-xs font-medium mb-1 size-6 flex items-center justify-center rounded-full text-primary-foreground",
        isToday && "bg-secondary text-black",
        !isCurrentMonth && "text-muted-foreground"
    )}
    >
    {day.day}
    </div>

    <div class="space-y-0.5">
    {#each dayEvents as event (`aneventfortheday${event.id}`)}
        <div
            class="text-xs px-1 py-0.5 rounded truncate border border-[#333333] dark rounded-md bg-foreground text-white"
            title={event.name}
        >
            {event.name}
        </div>
    {/each}
    </div>
</div>