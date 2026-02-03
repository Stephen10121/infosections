<script lang="ts">
    import { cn, type EventDBModel } from "./utils";

    let {
        index,
        events,
        day,
        currentDate
    }: {
        index: number,
        events: EventDBModel[],
        day: Date,
        currentDate: Date
    } = $props();

    function isSameDay(date1: Date, date2: Date): boolean {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        )
    }


    function getEventsForDate(events: EventDBModel[], date: Date): EventDBModel[] {
        return events.filter((event) => {
            const eventStart = new Date(event.startTime)
            return isSameDay(eventStart, date)
        })
    }

    const dayEvents = getEventsForDate(events, day)
    const isToday = isSameDay(day, new Date())
    const currentMonth = currentDate.getMonth()
    const isCurrentMonth = day.getMonth() === currentMonth
</script>

<div
    class={cn(
    "min-h-[80px] p-1 border-b border-r relative",
    !isCurrentMonth && "bg-muted/30",
    index % 7 === 6 && "border-r-0"
    )}
>
    <div
    class={cn(
        "text-xs font-medium mb-1 size-6 flex items-center justify-center rounded-full",
        isToday && "bg-primary text-primary-foreground",
        !isCurrentMonth && "text-muted-foreground"
    )}
    >
    {day.getDate()}
    </div>

    <div class="space-y-0.5">
    {#each dayEvents.slice(0, 2) as event (`aneventfortheday${event.id}`)}
        <div
        class={cn(
            "text-xs px-1 py-0.5 rounded truncate",
            event.featured
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
        title={event.name}
        >
        {event.name}
        </div>
    {/each}
    {#if dayEvents.length > 2}
        <div class="text-xs text-muted-foreground px-1">
        +{dayEvents.length - 2}
        </div>
    {/if}
    </div>
</div>