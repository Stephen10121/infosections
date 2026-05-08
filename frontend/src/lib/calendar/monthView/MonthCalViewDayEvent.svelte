<script lang="ts">
    import type { CalendarCustomizations } from "@/cal.utils";
    import type { EventDBModel } from "@/event.utils";
    import { Temporal } from "temporal-polyfill";
    import Time from "@/Time.svelte";

    let { event, timeZone, calendarCustomizations, currentDay, fontScale }: { event: EventDBModel, timeZone: Temporal.TimeZoneLike, calendarCustomizations: CalendarCustomizations, currentDay: Temporal.ZonedDateTime, fontScale: number } = $props();

    const start = $derived(Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone));

    const EVENT_DAY_NUMBER = $derived(Math.ceil(Math.abs((currentDay ? currentDay.toInstant().epochMilliseconds : 0) - start.startOfDay().toInstant().epochMilliseconds) / (1000 * 60 * 60 * 24)+1));
</script>

<div
    class="px-1 py-0.5 truncate border border-[#333333] dark rounded-md bg-foreground text-white flex justify-between gap-1"
    style="font-size: {fontScale * 12}px;"
    title={event.name}
>
    <span class="overflow-hidden whitespace-nowrap text-ellipsis">
        {event.name}
    </span>
    <span class="text-muted-foreground">
        {#if EVENT_DAY_NUMBER !== 1}
            Day {EVENT_DAY_NUMBER}
        {:else}
            <Time date={start} useAMPM={calendarCustomizations.useAMPM} />
        {/if}
    </span>
</div>