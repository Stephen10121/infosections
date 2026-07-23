<script lang="ts">
	import { cn } from "@/utils";
	import type { Snippet } from "svelte";
	import type { ClassValue } from "tailwind-variants";

	let { class: className, children }: { children: Snippet; class: ClassValue } = $props();
</script>

<span class={cn("font-mono", className)} style="font-family: 'JetBrains Mono', monospace">
	{@render children?.()}
</span>
