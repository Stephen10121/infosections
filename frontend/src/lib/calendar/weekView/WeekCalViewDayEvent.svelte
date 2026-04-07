<script lang="ts">
    import { type CalendarCustomizations, MONTHTOSTRING } from "@/utils";
    import { CalendarPlus, Clock, } from "@lucide/svelte";
    import { type EventDBModel } from "@/event.utils";
    import { Temporal } from "temporal-polyfill";
    import Time from "@/Time.svelte";

    let { event, currentDay, calendarCustomizations, timeZone }: { event: EventDBModel, currentDay: Temporal.ZonedDateTime, calendarCustomizations: CalendarCustomizations, timeZone: Temporal.TimeZoneLike } = $props();

    const start = $derived(Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone));
    const end = $derived(Temporal.Instant.from(event.endTime).toZonedDateTimeISO(timeZone));

    const hours = $derived(start.until(end, { largestUnit: "hours" }).total({ unit: "hours" }));

    const EVENT_DAY_NUMBER = $derived(Math.ceil(Math.abs((currentDay ? currentDay.toInstant().epochMilliseconds : 0) - start.startOfDay().toInstant().epochMilliseconds) / (1000 * 60 * 60 * 24)+1));
    const MULTI_DAY_EVENT = $derived(hours === 24 ? start.hour !== 0 : hours > 24);
</script>

<div class="dark rounded bg-foreground p-2 flex flex-col gap-2" style="border: 1px solid #333333">
    <div class="dark flex items-start justify-between">
        <h3 class="dark text-md font-semibold text-white pr-2">{event.name}</h3>
    </div>
    
    <div class="flex items-center gap-2 text-sm text-gray-400">
        <Clock class="h-4 w-4" />
        {#if MULTI_DAY_EVENT}
            <span class="text-sm text-gray-300">{MONTHTOSTRING[start.month]} {start.day}, <Time date={start} useAMPM={calendarCustomizations.useAMPM} /> - {MONTHTOSTRING[end.month]} {end.day}, <Time date={end} useAMPM={calendarCustomizations.useAMPM} /></span>
        {:else}
            <span class="text-sm text-gray-300"><Time date={start} useAMPM={calendarCustomizations.useAMPM} /> - {#if hours === 24 && start.hour === 0}{MONTHTOSTRING[end.month]} {end.day}, {/if} <Time date={end} useAMPM={calendarCustomizations.useAMPM} /></span>
        {/if}
    </div>

    {#if MULTI_DAY_EVENT}
        <div class="flex items-center gap-2 text-sm text-gray-400">
            <CalendarPlus class="h-4 w-4" />
            <span class="text-gray-300">Multi-day event - Day {EVENT_DAY_NUMBER}</span>
        </div>
    {/if}
</div>