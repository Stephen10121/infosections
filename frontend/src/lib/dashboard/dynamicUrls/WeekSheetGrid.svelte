<script lang="ts">
	import { onMount } from "svelte";

	import type { WeekSheetTimeSlot } from "@/utils";
	import { Button } from "@/components/ui/button";
	import { Check, Trash2, X } from "@lucide/svelte";
	import { Input } from "@/components/ui/input";
	import WeekSheetDaySlot from "./WeekSheetDaySlot.svelte";

	const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	const TOTAL_MINUTES = 1440
	const SNAP_INTERVAL = 15
	const HOUR_HEIGHT = 48 // px per hour
	const GRID_HEIGHT = 24 * HOUR_HEIGHT // total grid height

	let { weekSheet = $bindable(), onchange }: { weekSheet: WeekSheetTimeSlot[][], onchange: (newWeekSheet: WeekSheetTimeSlot[][]) => unknown } = $props();

	function minuteToY(minute: number) {
		return (minute / TOTAL_MINUTES) * GRID_HEIGHT
	}

	function yToMinute(y: number) {
		const raw = (y / GRID_HEIGHT) * TOTAL_MINUTES
		return Math.max(0, Math.min(TOTAL_MINUTES, Math.round(raw / SNAP_INTERVAL) * SNAP_INTERVAL))
	}

	function formatTime(minute: number) {
		const h = Math.floor(minute / 60)
		const m = minute % 60
		const period = h >= 12 ? "PM" : "AM"
		const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
		return `${h12}:${m.toString().padStart(2, "0")} ${period}`
	}

	type DragState =
	| { type: "creating"; dayIndex: number; startMinute: number; currentMinute: number }
	| { type: "resizing"; dayIndex: number; slotIndex: number; edge: "top" | "bottom"; startMinute: number; currentMinute: number }
	| null

	type EditingSlot = {
		dayIndex: number
		slotIndex: number | "new"
		link: string
		startMinute: number
		endMinute: number
	} | null

	let gridRef: HTMLDivElement | null = $state(null);
	let dragState: DragState | null = $state(null);
	let editingSlot: EditingSlot | null = $state(null);
	let selectedSlot: { dayIndex: number; slotIndex: number } | null = $state(null);

	function getRelativeY(e: MouseEvent, dayEl: HTMLElement) {
		const rect = dayEl.getBoundingClientRect();
		return e.clientY - rect.top;
	}

	function getDayElement(dayIndex: number): HTMLElement | null {
		if (!gridRef) return null;
		return gridRef.querySelector(`[data-day="${dayIndex}"]`);
	}

	// Mouse move + mouse up listeners
	function handleMouseMove(e: MouseEvent) {
		const state = dragState;
		if (!state) return;

		const dayEl = getDayElement(state.dayIndex);
		if (!dayEl) return;

		const y = getRelativeY(e, dayEl);
		const minute = yToMinute(y);

		dragState = dragState
		? { ...dragState, currentMinute: minute }
		: null;
	}

	function handleMouseUp() {
		const state = dragState;
		if (!state) return;

		if (state.type === "creating") {
			const start = Math.min(state.startMinute, state.currentMinute);
			const end = Math.max(state.startMinute, state.currentMinute);

			if (end - start >= SNAP_INTERVAL) {
				editingSlot = {
					dayIndex: state.dayIndex,
					slotIndex: "new",
					link: "",
					startMinute: start,
					endMinute: end
				};
			}
		} else if (state.type === "resizing") {
			const day = [...weekSheet[state.dayIndex]];
			const slot = day[state.slotIndex];

			let newStart = slot.startMinute;
			let newEnd = slot.endMinute;

			if (state.edge === "top") {
				newStart = Math.min(state.currentMinute, slot.endMinute - SNAP_INTERVAL);
			} else {
				newEnd = Math.max(state.currentMinute, slot.startMinute + SNAP_INTERVAL);
			}

			day[state.slotIndex] = { ...slot, startMinute: newStart, endMinute: newEnd };

			const updated = [...weekSheet];
			updated[state.dayIndex] = day;
			onchange(updated);
		}

		dragState = null;
	}

	// Register global listeners
	onMount(() => {
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	});

	function handleDayMouseDown(e: MouseEvent, dayIndex: number) {
		if ((e.target as HTMLElement).closest("[data-block]")) return;

		const dayEl = getDayElement(dayIndex);
		if (!dayEl) return;

		const y = getRelativeY(e, dayEl);
		const minute = yToMinute(y);

		dragState = {
			type: "creating",
			dayIndex,
			startMinute: minute,
			currentMinute: minute
		};

		selectedSlot = null;
		editingSlot = null;
	}

	function handleResizeStart(
		e: MouseEvent,
		dayIndex: number,
		slotIndex: number,
		edge: "top" | "bottom"
	) {
		e.stopPropagation();
		e.preventDefault();

		const slot = weekSheet[dayIndex][slotIndex];
		const startMinute = edge === "top" ? slot.startMinute : slot.endMinute;

		dragState = {
			type: "resizing",
			dayIndex,
			slotIndex,
			edge,
			startMinute,
			currentMinute: startMinute
		};
	}

	function handleBlockClick(e: MouseEvent, dayIndex: number, slotIndex: number) {
		e.stopPropagation();
		if (dragState) return;

		selectedSlot = { dayIndex, slotIndex };
		editingSlot = null;
	}

	function handleSaveNewSlot() {
		if (!editingSlot || editingSlot.slotIndex !== "new") return;

		const { dayIndex, link, startMinute, endMinute } = editingSlot;

		const updated = [...weekSheet];
		updated[dayIndex] = [...updated[dayIndex], { startMinute, endMinute, link }];
		updated[dayIndex].sort((a, b) => a.startMinute - b.startMinute);

		onchange(updated);
		editingSlot = null;
	}

	function handleDeleteSlot(dayIndex: number, slotIndex: number) {
		const updated = [...weekSheet];
		updated[dayIndex] = updated[dayIndex].filter((_, i) => i !== slotIndex);
		onchange(updated);
		selectedSlot = null;
	}

	let previewBlock: {
		dayIndex: number,
		top: number,
		height: number,
		startMinute: number,
		endMinute: number
	} | null = $state(null);

	$effect(() => {
		if (dragState && dragState.type === "creating") {
			previewBlock = {
				dayIndex: dragState.dayIndex,
				top: minuteToY(Math.min(dragState.startMinute, dragState.currentMinute)),
				height: minuteToY(Math.abs(dragState.currentMinute - dragState.startMinute)),
				startMinute: Math.min(dragState.startMinute, dragState.currentMinute),
				endMinute: Math.max(dragState.startMinute, dragState.currentMinute)
			}
		} else {
			previewBlock = null;
		}
	});

	let resizePreview: {
		dayIndex: number,
		slotIndex: number,
		startMinute: number,
		endMinute: number
	} | null = $state(null);

	$effect(() => {
		if (dragState && dragState.type === "resizing") {
			const slot = weekSheet[dragState.dayIndex][dragState.slotIndex];
			let start = slot.startMinute;
			let end = slot.endMinute;

			if (dragState.edge === "top") {
				start = Math.min(dragState.currentMinute, end - SNAP_INTERVAL);
			} else {
				end = Math.max(dragState.currentMinute, start + SNAP_INTERVAL);
			}

			resizePreview = {
				dayIndex: dragState.dayIndex,
				slotIndex: dragState.slotIndex,
				startMinute: start,
				endMinute: end
			};
		} else {
			resizePreview = null;
		}
	});
</script>

<div class="space-y-3">
	<p class="text-xs text-muted-foreground">
		Click and drag on the grid to create time blocks. Click a block to edit or delete it.
	</p>

	<div class="rounded-lg border border-border overflow-hidden bg-card">
		<div class="grid border-b border-border" style="grid-template-columns: 56px repeat(7, 1fr);">
			<div class="p-2"></div>
			{#each DAY_LABELS as day (`aDay${day}`)}
				<div class="p-2 text-xs font-semibold text-center text-foreground border-l border-border">{day}</div>
			{/each}
		</div>

		<div class="overflow-y-auto">
			<div bind:this={gridRef} class="grid relative" style="grid-template-columns: 56px repeat(7, 1fr)">
				<div class="relative" style="height: {GRID_HEIGHT}px;">
					{#each { length: 24 } as _, i (`hourHeight${i}`)}
						<div
							class="absolute w-full text-right pr-2 text-[10px] text-muted-foreground leading-none"
							style="top: {i * HOUR_HEIGHT - 5}px;"
						>
							{i === 0 ? "" : formatTime(i * 60)}
						</div>
					{/each}
				</div>

				{#each DAY_LABELS as _, dayIndex (`adayindex${dayIndex}`)}
					<WeekSheetDaySlot
						dayIndex={dayIndex}
						{weekSheet}
						{handleDayMouseDown}
						{handleBlockClick}
						{handleResizeStart}
						{GRID_HEIGHT}
						{HOUR_HEIGHT}
						{previewBlock}
						{resizePreview}
						{formatTime}
						{selectedSlot}
						{minuteToY}
					/>
				{/each}
			</div>
		</div>
	</div>

	{#if editingSlot && editingSlot.slotIndex === "new"}
		<div class="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
			<p class="text-xs font-medium text-foreground">
				New block: {DAY_LABELS[editingSlot.dayIndex]} {formatTime(editingSlot.startMinute)} - {formatTime(editingSlot.endMinute)}
			</p>

			<div class="flex items-center gap-2">
				<Input
					bind:value={editingSlot.link}
					placeholder="https://example.com/redirect-url"
					class="flex-1 text-sm"
					autofocus
					onkeydown={(e) => {
						if (e.key === "Enter") handleSaveNewSlot()
						if (e.key === "Escape") editingSlot=null
					}}
				/>
				<Button size="sm" onclick={handleSaveNewSlot} class="gap-1 shrink-0">
					<Check class="h-3.5 w-3.5" />
					Add
				</Button>
				<Button size="sm" variant="ghost" onclick={() => editingSlot = null} class="shrink-0">
					<X class="h-3.5 w-3.5" />
				</Button>
			</div>
		</div>
	{/if}

	{#if selectedSlot && weekSheet[selectedSlot.dayIndex]?.[selectedSlot.slotIndex]}
		<div class="rounded-lg border border-border bg-secondary/50 p-3 space-y-3">
			<div class="flex items-center justify-between">
				<p class="text-xs font-medium text-foreground">
					{DAY_LABELS[selectedSlot.dayIndex]}{" "}
					{formatTime(weekSheet[selectedSlot.dayIndex][selectedSlot.slotIndex].startMinute)} -{" "}
					{formatTime(weekSheet[selectedSlot.dayIndex][selectedSlot.slotIndex].endMinute)}
				</p>
				<Button
					size="sm"
					onclick={() => {
						if(selectedSlot) {
							handleDeleteSlot(selectedSlot.dayIndex, selectedSlot.slotIndex)
						}
					}}
					class="gap-1 text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/10 h-7"
				>
					<Trash2 class="h-3.5 w-3.5" />
					Delete
				</Button>
			</div>
			<Input
				value={weekSheet[selectedSlot.dayIndex][selectedSlot.slotIndex].link}
				oninput={(e) => {
					if (selectedSlot) {
						//@ts-ignore
						weekSheet[selectedSlot.dayIndex][selectedSlot.slotIndex].link = e.target.value;
						weekSheet = weekSheet;
						onchange(weekSheet);
					}
				}}
				placeholder="https://example.com/redirect-url"
				class="text-sm"
			/>
			<Button size="sm" variant="outline" onclick={() => selectedSlot = null} class="text-xs">
				Done
			</Button>
		</div>
	{/if}
</div>