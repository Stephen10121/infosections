<script lang="ts">
    import type { Temporal } from "temporal-polyfill";
    import { MONTHTOSTRING } from "./utils";
    import Time from "./Time.svelte";

    let { date }: { date: Temporal.ZonedDateTime } = $props();
</script>

{MONTHTOSTRING[date.month]} {date.day} {date.year} <Time {date} useAMPM />