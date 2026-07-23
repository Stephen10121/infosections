<script lang="ts">
	import { type CalendarCustomizations, type CalendarFilters } from "./cal.utils";
	import { dateRangeOverlaps, LONGDAYTOSTRING, MONTHTOSTRING } from "./utils";
	import { type EventDBModelExpanded } from "./event.utils";
	import { Temporal } from "temporal-polyfill";
	import Event from "./Event.svelte";

	let {
		events,
		day,
		dayNumber,
		calendarCustomizations,
		timeZone,
		filters,
		fontScale
	}: {
		events: EventDBModelExpanded[];
		day: Temporal.ZonedDateTime;
		dayNumber: number;
		calendarCustomizations: CalendarCustomizations;
		timeZone: Temporal.TimeZoneLike;
		filters: CalendarFilters;
		fontScale: number;
	} = $props();

	let nextDay = $derived(day.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));
</script>

<div class="dark flex flex-col gap-4">
	<div class="dark flex flex-col gap-1">
		<div class="dark font-medium text-muted-foreground" style="font-size: {fontScale * 14}px;">
			{#if dayNumber === 1}
				Today
			{:else if dayNumber === 2}
				Tomorrow
			{:else if dayNumber === 3}
				Day after Tomorrow
			{/if}
		</div>
		<div class="dark font-semibold text-white" style="font-size: {fontScale * 20}px;">
			{LONGDAYTOSTRING[day.dayOfWeek]}, {MONTHTOSTRING[day.month]}
			{day.day}
		</div>
	</div>

	<div class="dark flex flex-col gap-4">
		{#each events as event (`eventListDat${day.toString()}${event.id}`)}
			{#if !(!event.featured && filters.onlyShowFeatured) && !(!event.visibleInChurchCenter && filters.hideUnpublished)}
				{#if dateRangeOverlaps(day.toInstant().epochMilliseconds, nextDay.toInstant().epochMilliseconds, new Date(event.startTime).valueOf(), new Date(event.endTime).valueOf())}
					<Event {calendarCustomizations} {event} {timeZone} currentDay={day} {fontScale} />
				{/if}
			{/if}
		{/each}
	</div>
</div>
