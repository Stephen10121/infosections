<script lang="ts">
    import { Temporal } from "temporal-polyfill";
    import Event from "./Event.svelte";
    import { dateRangeOverlaps, LONGDAYTOSTRING, MONTHTOSTRING, type CalendarCustomizations, type CalendarFilters, type EventDBModel } from "./utils";

    let { events, day, dayNumber, calendarCustomizations, timeZone, filters }: { events: EventDBModel[], day: Temporal.ZonedDateTime, dayNumber: number, calendarCustomizations: CalendarCustomizations, timeZone: Temporal.TimeZoneLike, filters: CalendarFilters } = $props();

    let nextDay = $derived(day.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));
</script>

<div class="dark flex flex-col gap-4">
    <div class="dark flex flex-col gap-1">
        <div class="dark text-sm font-medium text-muted-foreground">
            {#if dayNumber === 1}
                Today
            {:else if dayNumber === 2}
                Tomorrow
            {:else if dayNumber === 3}
                Day after Tomorrow
            {/if}
        </div>
        <div class="dark text-xl font-semibold text-accent">{LONGDAYTOSTRING[day.dayOfWeek]}, {MONTHTOSTRING[day.month]} {day.day}</div>
    </div>

    <div class="dark flex flex-col gap-4">
        {#each events as event (`eventListDat${day.toString()}${event.id}`)}
            {#if !(!event.featured && filters.onlyShowFeatured) && !(!event.visibleInChurchCenter && filters.hideUnpublished)}
                {#if dateRangeOverlaps(day.toInstant().epochMilliseconds, nextDay.toInstant().epochMilliseconds, (new Date(event.startTime)).valueOf(), (new Date(event.endTime)).valueOf())}
                    <Event {calendarCustomizations} {event} {timeZone} currentDay={day} />
                {/if}
            {/if}
        {/each}
    </div>
</div>