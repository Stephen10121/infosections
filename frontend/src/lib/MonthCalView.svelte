<script lang="ts">
    import { Temporal } from "temporal-polyfill";
    import MonthCalViewDay from "./MonthCalViewDay.svelte";
    import { getDaysInMonth, type EventDBModel } from "./utils";

    let {
        events,
        timeZone,
        currentDate,
    }: {
        events: EventDBModel[],
        timeZone: Temporal.TimeZoneLike,
        currentDate: Temporal.ZonedDateTime
    } = $props();

    $inspect(currentDate);
    
    let days = $derived(getDaysInMonth(currentDate, timeZone))
</script>

<div class="dark h-full">
    <div class="overflow-hidden h-screen">
        <div class="grid grid-cols-7 dark bg-foreground">
            {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as day (`aweekday${day}`)}
                <div class="text-center py-2 text-xs text-muted-foreground dark font-semibold text-white border-b border-[#333333]">
                    {day}
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-7 h-full">
            {#each days as day, index (`adayinmonth${index}`)}
                <MonthCalViewDay {index} {events} {day} {currentDate} />
            {/each}
        </div>
    </div>
</div>