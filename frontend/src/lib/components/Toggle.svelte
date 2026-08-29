<script lang="ts">
	import { cn } from "@/utils";

	let { on = $bindable() }: { on: boolean } = $props();
</script>

<button
	type="button"
	onclick={() => (on = !on)}
	class={cn(
		"relative w-9 h-5 shrink-0 transition-colors duration-150 cursor-pointer focus:outline-none",
		on ? "bg-primary" : "bg-border"
	)}
	role="switch"
	aria-checked={on}
	title="toggle switch"
>
	<span
		class={cn(
			"absolute top-0.5 w-4 h-4 bg-white transition-transform duration-150 shadow-sm",
			on ? "translate-x-0" : "-translate-x-4"
		)}
	></span>
</button>
