<script lang="ts">
    import { getDaysInMonth, type CalendarCustomizations } from "../../utils";
    import MonthCalViewDay from "./MonthCalViewDay.svelte";
    import { type EventDBModel } from "../../event.utils";
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
    
    let days = $derived(getDaysInMonth(currentDate))
</script>

<div class="dark h-full">
    <div class="overflow-hidden h-screen">
        <div class="grid grid-cols-7 dark bg-foreground">
            {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as day (`aweekday${day}`)}
                <div class="text-center py-2 text-xs dark font-semibold text-white border-b border-[#333333]">
                    {day}
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-7 h-full">
            {#each days as day, index (`adayinmonth${index}`)}
                <MonthCalViewDay {index} {events} {day} {currentDate} {timeZone} {calendarCustomizations} />
            {/each}
        </div>
    </div>
</div>