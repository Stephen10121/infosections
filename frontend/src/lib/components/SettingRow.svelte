<script lang="ts">
	import type { Snippet } from "svelte";
	import Mono from "./Mono.svelte";

	let { label, sub, children }: { label: string; sub?: string; children?: Snippet } = $props();
</script>

<div class="flex items-center justify-between py-3 border-b border-border/40 last:border-b-0">
	<div class="min-w-0 mr-4">
		<div class="text-xs text-foreground" style="font-family: Inter, sans-serif">{label}</div>
		{#if sub}
			<Mono class="text-[10px] text-muted-foreground mt-0.5 block">{sub}</Mono>
		{/if}
	</div>
	{@render children?.()}
</div>
