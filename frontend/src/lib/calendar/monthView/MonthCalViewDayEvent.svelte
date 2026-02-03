<script lang="ts">
    import Time from "@/Time.svelte";
    import type { CalendarCustomizations, EventDBModel } from "@/utils";
    import { Temporal } from "temporal-polyfill";

    let { event, timeZone, calendarCustomizations }: { event: EventDBModel, timeZone: Temporal.TimeZoneLike, calendarCustomizations: CalendarCustomizations } = $props();

    const start = $derived(Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone));
</script>

<div
    class="text-xs px-1 py-0.5 rounded truncate border border-[#333333] dark rounded-md bg-foreground text-white flex justify-between gap-1"
    title={event.name}
>
    <span class="overflow-hidden whitespace-nowrap text-ellipsis">{event.name}</span>
    <span><Time date={start} useAMPM={calendarCustomizations.useAMPM} /></span>
</div>