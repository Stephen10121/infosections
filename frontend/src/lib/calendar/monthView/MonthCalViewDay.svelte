<script lang="ts">
    import MonthCalViewDayEvent from "./MonthCalViewDayEvent.svelte";
    import { cn, getEventsForDate, isSameDay, type CalendarCustomizations, type EventDBModel } from "../../utils";
    import { Temporal } from "temporal-polyfill";

    let {
        index,
        events,
        day,
        timeZone,
        calendarCustomizations,
        currentDate
    }: {
        index: number,
        events: EventDBModel[],
        day: Temporal.ZonedDateTime,
        timeZone: Temporal.TimeZoneLike,
        calendarCustomizations: CalendarCustomizations,
        currentDate: Temporal.ZonedDateTime
    } = $props();

    let nextDay = $derived(day.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));

    let dayEvents = $derived(getEventsForDate(events, day, nextDay))
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
            <MonthCalViewDayEvent {event} {timeZone} {calendarCustomizations} currentDay={day} />
        {/each}
    </div>
</div>