<script lang="ts">
    import { MONTHTOSTRING, type EventTimesType } from "./utils";
    import Time from "./Time.svelte";
    import { Temporal } from "temporal-polyfill";

    let { time, useAMPM, multiDayEvent, today, timeZone }: { time: EventTimesType, useAMPM: boolean, multiDayEvent: boolean, today: Temporal.ZonedDateTime, timeZone: Temporal.TimeZoneLike } = $props();

    let start = $derived(Temporal.Instant.from(time.startTime).toZonedDateTimeISO(timeZone));
    let end = $derived(Temporal.Instant.from(time.endTime).toZonedDateTimeISO(timeZone));
</script>

{time.name}: {#if multiDayEvent && start.day !== today.day}{MONTHTOSTRING[start.month]} {start.day}, {/if} <Time date={start} {useAMPM} /> - {#if multiDayEvent && end.day !== today.day}{MONTHTOSTRING[end.month]} {end.day}, {/if} <Time date={end} {useAMPM} />
