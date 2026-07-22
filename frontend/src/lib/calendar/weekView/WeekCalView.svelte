<script lang="ts">
	import { type CalendarCustomizations } from "../../cal.utils";
	import { type EventDBModel } from "../../event.utils";
	import WeekCalViewDay from "./WeekCalViewDay.svelte";
	import { Temporal } from "temporal-polyfill";
	import { getDayRange } from "../../utils";

	let {
		events,
		currentDate,
		timeZone,
		calendarCustomizations,
		fontScale
	}: {
		events: EventDBModel[];
		currentDate: Temporal.ZonedDateTime;
		timeZone: Temporal.TimeZoneLike;
		calendarCustomizations: CalendarCustomizations;
		fontScale: number;
	} = $props();

	let days = $derived(getDayRange(currentDate, 7));
</script>

<div class="dark h-full">
	<div class="overflow-hidden h-screen">
		<div class="grid grid-cols-7 dark bg-foreground">
			{#each days as day (`aweekday${day.dayOfWeek}`)}
				<div
					class="text-center py-2 text-muted-foreground dark font-semibold border-b border-[#333333]"
					style="font-size: {fontScale * 12}px;"
				>
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day.dayOfWeek]}
				</div>
			{/each}
		</div>

		<div class="grid grid-cols-7 h-full">
			{#each days as day, index (`adayinmonth${index}`)}
				<WeekCalViewDay
					{index}
					{events}
					{day}
					{currentDate}
					{timeZone}
					{calendarCustomizations}
					{fontScale}
				/>
			{/each}
		</div>
	</div>
</div>
