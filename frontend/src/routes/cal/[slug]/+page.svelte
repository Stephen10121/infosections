<script lang="ts">
	import { CircleQuestionMark, Fullscreen } from "@lucide/svelte";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { getEventsForCalendar } from "./eventFetch.remote.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import Button from "@/components/ui/button/button.svelte";
	import { Switch } from "@/components/ui/switch/index.js";
	import TimeZoneSelector from "@/TimeZoneSelector.svelte";
	import { Label } from "@/components/ui/label/index.js";
	import { toggleFullScreen } from "@/utils.js";
	import { Temporal } from "temporal-polyfill";
	import Calendar from "@/Calendar.svelte";
	import { PersistedState } from "runed";
	import { onMount } from "svelte";

	let { data } = $props();

	let invisibleTooltip = $state(false);
	let timeZone = $state(Temporal.Now.timeZoneId());
	// svelte-ignore state_referenced_locally
	let persistedFontScale = new PersistedState(`CalendarFontScale${data.id}`, 1);
	let fontScale = $derived(persistedFontScale.current);

	let events = $derived(await getEventsForCalendar(data.id));

	onMount(() => {
		document.body.classList.add("dark");
	});
</script>

<svelte:head>
	<title>{data.name}</title>
	<link rel="shortcut icon" href={data.logoLink} type="image/x-icon" />
</svelte:head>

<div id="cal-root" class="dark min-h-screen w-full bg-background relative">
	<Calendar
		calId={data.id}
		{events}
		displaySettings={data.displaySettings}
		{timeZone}
		filters={data.filters}
		{fontScale}
	/>
	<Popover.Root>
		<Popover.Trigger
			class="absolute bottom-1 right-1 z-50 {invisibleTooltip
				? 'opacity-0'
				: 'text-muted-foreground bg-foreground'} rounded p-2"
			style={invisibleTooltip ? "border:none;" : "border: 1px solid #333333"}
		>
			<CircleQuestionMark />
		</Popover.Trigger>
		<Popover.Content
			class="text-muted-foreground bg-foreground rounded p-2 flex flex-col gap-3"
			style="border: 1px solid #333333"
		>
			<TimeZoneSelector bind:timeZone />
			<div class="dark flex items-center gap-2 justify-between">
				<Label for="useinvis" class="dark text-sm">Hide tooltip (you can still click it)</Label>
				<Switch class="dark" id="useinvis" bind:checked={invisibleTooltip} />
			</div>
			<p>Font scale: {fontScale}x</p>
			<Slider
				type="single"
				bind:value={persistedFontScale.current}
				max={2}
				min={0.25}
				step={0.05}
				title="Change font scale"
			/>
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
