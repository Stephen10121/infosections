<script lang="ts">
    import { cn, type WeekSheetTimeSlot } from "@/utils";
    import { GripVertical } from "@lucide/svelte";

    let {
        resizePreview,
        dayIndex,
        slotIndex,
        slot,
        minuteToY,
        selectedSlot,
        handleBlockClick,
        handleResizeStart,
        formatTime
    }: {
        resizePreview: {
            dayIndex: number,
            slotIndex: number,
            startMinute: number,
            endMinute: number
        } | null,
        dayIndex: number,
        slotIndex: number,
        slot: WeekSheetTimeSlot,
        minuteToY: (minute: number) => number,
        selectedSlot: { dayIndex: number; slotIndex: number } | null,
        handleBlockClick: (e: MouseEvent, dayIndex: number, slotIndex: number) => unknown,
        handleResizeStart: (
            e: MouseEvent,
            dayIndex: number,
            slotIndex: number,
            edge: "top" | "bottom"
        ) => unknown,
        formatTime: (minute: number) => string
    } = $props();

    const isResizing = $derived(resizePreview?.dayIndex === dayIndex && resizePreview?.slotIndex === slotIndex);
    const start = $derived(isResizing && resizePreview ? resizePreview.startMinute : slot.startMinute);
    const end = $derived(isResizing && resizePreview ? resizePreview.endMinute : slot.endMinute);
    const top = $derived(minuteToY(start));
    const height = $derived(minuteToY(end) - top);
    const isSelected = $derived(selectedSlot?.dayIndex === dayIndex && selectedSlot?.slotIndex === slotIndex);
</script>

<div
    data-block
    class={cn(
        "absolute left-0.5 right-0.5 rounded-md overflow-hidden cursor-pointer transition-shadow group",
        "bg-ring/20 border border-ring/40",
        isSelected && "ring-2 ring-ring shadow-lg z-20",
        isResizing && "opacity-80",
    )}
    style="top:{top}px;height:{Math.max(height, 16)}px"
    onclick={(e) => handleBlockClick(e, dayIndex, slotIndex)}
    role="none"
    >
    
    <div
        role="none"
        class="absolute top-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onmousedown={(e) => handleResizeStart(e, dayIndex, slotIndex, "top")}
    >
        <GripVertical class="h-2.5 w-2.5 text-primary rotate-90" />
    </div>

    <div class="px-1 py-0.5 h-full flex flex-col justify-center">
        <p class="text-[9px] font-medium text-primary leading-tight">
            {formatTime(start)}
        </p>

        {#if height > 30}
            <p class="text-[8px] text-primary/70 truncate leading-tight mt-0.5">
                {slot.link}
                <!-- {slot.link ? new URL(slot.link).hostname : "No URL"} -->
            </p>
        {/if}

        {#if height > 45}
            <p class="text-[9px] text-primary/60 leading-tight">
                {formatTime(end)}
            </p>
        {/if}
    </div>

    <div
        role="none"
        class="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onmousedown={(e) => handleResizeStart(e, dayIndex, slotIndex, "bottom")}
    >
        <GripVertical class="h-2.5 w-2.5 text-primary rotate-90" />
    </div>
</div>