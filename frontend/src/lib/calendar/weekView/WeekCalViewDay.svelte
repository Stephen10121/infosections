<script lang="ts">
	import WeekCalViewDayEvent from "./WeekCalViewDayEvent.svelte";
	import { type CalendarCustomizations } from "../../cal.utils";
	import { cn, getEventsForDate, isSameDay } from "../../utils";
	import { type EventDBModel } from "../../event.utils";
	import { Temporal } from "temporal-polyfill";

	let {
		index,
		events,
		day,
		timeZone,
		calendarCustomizations,
		currentDate,
		fontScale
	}: {
		index: number;
		events: EventDBModel[];
		day: Temporal.ZonedDateTime;
		timeZone: Temporal.TimeZoneLike;
		calendarCustomizations: CalendarCustomizations;
		currentDate: Temporal.ZonedDateTime;
		fontScale: number;
	} = $props();

	let nextDay = $derived(day.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));

	let dayEvents = $derived(getEventsForDate(events, day, nextDay));
	let isToday = $derived(isSameDay(day, currentDate));
	let currentMonth = $derived(currentDate.month);
	let isCurrentMonth = $derived(day.month === currentMonth);
</script>

<div
	class={cn(
		"min-h-20 p-1 border-b border-r relative border-[#333333]",
		!isCurrentMonth && "bg-muted/30 opacity-[.40]",
		index % 7 === 6 && "border-r-0"
	)}
>
	<div
		class={cn(
			"text-xs font-medium mb-1 size-6 flex items-center justify-center rounded-full text-primary-foreground",
			isToday && "bg-secondary text-black",
			!isCurrentMonth && "text-muted-foreground"
		)}
	>
		{day.day}
	</div>

	<div class="space-y-1">
		{#each dayEvents as event (`aneventfortheday${event.id}`)}
			<WeekCalViewDayEvent
				{calendarCustomizations}
				{event}
				{timeZone}
				currentDay={day}
				{fontScale}
			/>
		{/each}
	</div>
</div>
