<script lang="ts">
    import { getDayRange, type CalendarCustomizations } from "../../utils";
    import { type EventDBModel } from "../../event.utils";
    import WeekCalViewDay from "./WeekCalViewDay.svelte";
    import { Temporal } from "temporal-polyfill";

    let {
        events,
        currentDate,
        timeZone,
        calendarCustomizations
    }: {
        events: EventDBModel[],
        currentDate: Temporal.ZonedDateTime,
        timeZone: Temporal.TimeZoneLike,
        calendarCustomizations: CalendarCustomizations
    } = $props();
    
    let days = $derived(getDayRange(currentDate, 7))
</script>

<div class="dark h-full">
    <div class="overflow-hidden h-screen">
        <div class="grid grid-cols-7 dark bg-foreground">
            {#each days as day (`aweekday${day.dayOfWeek}`)}
                <div class="text-center py-2 text-xs text-muted-foreground dark font-semibold border-b border-[#333333]">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day.dayOfWeek]}
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-7 h-full">
            {#each days as day, index (`adayinmonth${index}`)}
                <WeekCalViewDay {index} {events} {day} {currentDate} {timeZone} {calendarCustomizations} />
            {/each}
        </div>
    </div>
</div>