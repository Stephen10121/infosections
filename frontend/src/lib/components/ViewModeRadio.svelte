<script lang="ts">
	import type { CalendarDBModel } from "@/cal.utils";
	import { cn } from "@/utils";

	let { value = $bindable() }: { value: CalendarDBModel["displaySettings"]["viewType"] } = $props();
	const opts: { val: CalendarDBModel["displaySettings"]["viewType"]; label: string }[] = [
		{ val: "3day", label: "3-Day" },
		{ val: "week", label: "7-Day" },
		{ val: "month", label: "Month" }
	];
</script>

<div class="flex gap-1.5">
	{#each opts as { val, label } (val)}
		<button
			type="button"
			onclick={() => (value = val)}
			class={cn(
				"flex-1 py-1.5 font-mono text-[10px] tracking-widest border transition-colors cursor-pointer",
				value === val
					? "border-primary text-primary bg-primary/5"
					: "border-border text-muted-foreground hover:text-foreground"
			)}
		>
			{label.toUpperCase()}
		</button>
	{/each}
</div>
