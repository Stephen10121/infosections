<script lang="ts">
	import { cn } from "@/utils";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	interface Props extends HTMLTextareaAttributes {
		ref?: HTMLElement | undefined | null;
	}

	let { value = $bindable(), ref = $bindable(), ...restProps }: Props = $props();
</script>

<textarea
	bind:this={ref}
	{...restProps}
	class={cn(
		"w-full border border-border bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors",
		restProps.class
	)}
	style="font-family: 'JetBrains Mono', monospace"></textarea>
