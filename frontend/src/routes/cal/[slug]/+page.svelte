<script lang="ts">
    import Calendar from '@/Calendar.svelte';
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { CircleQuestionMark, Fullscreen } from '@lucide/svelte';
    import { Label } from '@/components/ui/label/index.js';
    import { Switch } from '@/components/ui/switch/index.js';
    import Button from '@/components/ui/button/button.svelte';
    import { toggleFullScreen } from '@/utils.js';
    import { onMount } from 'svelte';
    import { Temporal } from 'temporal-polyfill';
    import TimeZoneSelector from '@/TimeZoneSelector.svelte';

    let { data } = $props();

    let invisibleTooltip = $state(false);
    let timeZone = $state(Temporal.Now.timeZoneId());

    onMount(() => {
        document.body.classList.add("dark");
    });
</script>

<svelte:head>
    <title>{data.name}</title>
    <link rel="shortcut icon" href={data.logoLink} type="image/x-icon">
</svelte:head>

<div id="cal-root" class="dark min-h-screen w-full p-6 bg-background relative">
    <Calendar events={data.events} displaySettings={data.displaySettings} timeZone={timeZone} filters={data.filters} />
    <Popover.Root>
        <Popover.Trigger class="absolute bottom-1 right-1 z-50 {invisibleTooltip ? "opacity-0" : "text-muted-foreground bg-foreground"} rounded p-2" style={invisibleTooltip ? "border:none;" : "border: 1px solid #333333"}>
            <CircleQuestionMark />
        </Popover.Trigger>
        <Popover.Content class="text-muted-foreground bg-foreground rounded p-2" style="border: 1px solid #333333">
            <TimeZoneSelector bind:timeZone />
            <div class="dark flex items-center gap-2 justify-between">
                <Label for="useinvis" class="dark text-sm">Hide tooltip (you can still click it)</Label>
                <Switch class="dark" id="useinvis" bind:checked={invisibleTooltip} />
            </div>
            <Button onclick={toggleFullScreen} title="Fullscreen"><Fullscreen /></Button>
        </Popover.Content>
    </Popover.Root>
</div>

<style>
    /* Target the overall scrollbar */
    :global(::-webkit-scrollbar) {
        width: 0; /* Adjust width as desired */
        height: 5px; /* Adjust height for horizontal scrollbars */
    }

    /* Target the scrollbar track (the background area) */
    :global(::-webkit-scrollbar-track) {
        background: black;
    }

    /* Target the scrollbar thumb (the draggable part) */
    :global(::-webkit-scrollbar-thumb) {
        background-color: #888; /* A subtle gray for the thumb */
        border-radius: 4px; /* Rounded corners for the thumb */
    }

    /* Style the thumb on hover */
    :global(::-webkit-scrollbar-thumb:hover) {
        background-color: #555; /* Darker gray on hover */
    }
</style>