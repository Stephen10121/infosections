<script lang="ts">
    import { Temporal } from "temporal-polyfill";

    let { date, useAMPM }: { date: Temporal.ZonedDateTime, useAMPM: boolean } = $props();

    let hour = $state("");
    let minute = $state("");
    let isAM = $state(true);

    $effect(() => {
        if (useAMPM) {
            let tempHour = date.hour;
            if (tempHour > 12) {
                hour = String(date.hour - 12);
            } else {
                hour = String(date.hour);
            }
            if (tempHour < 1) {
                hour = "12"
            }
            isAM = tempHour < 12 || tempHour === 24;
        } else {
            hour = String(date.hour).padStart(2, "0");
        }
        minute = String(date.minute).padStart(2, "0");
    });
</script>

{hour}:{minute} {#if useAMPM}{#if isAM}AM{:else}PM{/if}{/if}