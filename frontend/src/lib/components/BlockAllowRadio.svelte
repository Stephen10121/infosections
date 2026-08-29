<script lang="ts">
	import type { CalendarDBModel } from "@/cal.utils";
	import { cn } from "@/utils";

	let {
		value = $bindable(),
		disabled
	}: {
		value:
			| CalendarDBModel["filters"]["resourceFilterType"]
			| CalendarDBModel["filters"]["tagFilterType"];
		disabled: boolean;
	} = $props();
</script>

<div class="flex gap-1.5">
	<button
		type="button"
		onclick={() => (value = "allow")}
		class={cn(
			"flex-1 py-1.5 font-mono text-[10px] tracking-widest border transition-colors cursor-pointer",
			value === "allow"
				? "border-primary text-primary bg-primary/5"
				: "border-border text-muted-foreground hover:text-foreground",
			disabled ? "opacity-25" : ""
		)}
		{disabled}
	>
		Allow
	</button>
	<button
		{disabled}
		type="button"
		onclick={() => (value = "block")}
		class={cn(
			"flex-1 py-1.5 font-mono text-[10px] tracking-widest border transition-colors cursor-pointer",
			value === "block"
				? "border-primary text-primary bg-primary/5"
				: "border-border text-muted-foreground hover:text-foreground",
			disabled ? "opacity-25" : ""
		)}
	>
		Block
	</button>
</div>
