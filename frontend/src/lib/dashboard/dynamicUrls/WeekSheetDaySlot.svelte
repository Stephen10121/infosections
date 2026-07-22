<script lang="ts">
	import type { WeekSheetTimeSlot } from "@/utils";
	import ADaySlot from "./ADaySlot.svelte";

	let {
		dayIndex,
		weekSheet,
		handleDayMouseDown,
		handleBlockClick,
		handleResizeStart,
		GRID_HEIGHT,
		HOUR_HEIGHT,
		previewBlock,
		resizePreview,
		formatTime,
		selectedSlot,
		minuteToY
	}: {
		dayIndex: number;
		weekSheet: WeekSheetTimeSlot[][];
		handleDayMouseDown: (e: any, dayIndex: number) => unknown;
		handleBlockClick: (e: MouseEvent, dayIndex: number, slotIndex: number) => unknown;
		handleResizeStart: (
			e: MouseEvent,
			dayIndex: number,
			slotIndex: number,
			edge: "top" | "bottom"
		) => unknown;
		GRID_HEIGHT: number;
		HOUR_HEIGHT: number;
		previewBlock: {
			dayIndex: number;
			top: number;
			height: number;
			startMinute: number;
			endMinute: number;
		} | null;
		resizePreview: {
			dayIndex: number;
			slotIndex: number;
			startMinute: number;
			endMinute: number;
		} | null;
		formatTime: (minute: number) => string;
		selectedSlot: { dayIndex: number; slotIndex: number } | null;
		minuteToY: (minute: number) => number;
	} = $props();

	let daySlots = $derived(weekSheet[dayIndex]);
</script>

<div
	data-day={dayIndex}
	class="relative border-l border-border cursor-crosshair select-none"
	style="height: {GRID_HEIGHT}px;"
	onmousedown={(e) => handleDayMouseDown(e, dayIndex)}
	role="none"
>
	{#each { length: 24 }, i}
		<div class="absolute w-full border-t border-border/40" style="top: {i * HOUR_HEIGHT}px"></div>
	{/each}

	{#each daySlots as slot, slotIndex (`aSlot${slotIndex}`)}
		<ADaySlot
			{slot}
			{dayIndex}
			{slotIndex}
			{minuteToY}
			{formatTime}
			{selectedSlot}
			{resizePreview}
			{handleBlockClick}
			{handleResizeStart}
		/>
	{/each}

	{#if previewBlock && previewBlock.dayIndex === dayIndex && previewBlock.height > 0}
		<div
			class="absolute left-0.5 right-0.5 rounded-md bg-primary/15 border-2 border-dashed border-primary/50 pointer-events-none z-10"
			style="top: {previewBlock.top}px;height:{previewBlock.height}px"
		>
			<div class="px-1 py-0.5">
				<p class="text-[9px] font-medium text-primary">
					{formatTime(previewBlock.startMinute)} - {formatTime(previewBlock.endMinute)}
				</p>
			</div>
		</div>
	{/if}
</div>
