<script lang="ts">
	import Mono from "@/components/Mono.svelte";
	import type { LucideProps } from "@lucide/svelte";
	import type { Component } from "svelte";

	let {
		label,
		value,
		icon: Icon
	}: { label: string; value: string | number; icon: Component<LucideProps> } = $props();
</script>

<div class="flex flex-col items-center p-4 border border-border flex-1">
	{#if Icon}
		<Icon size={14} class="text-muted-foreground mb-2" />
	{/if}
	<span class="text-xl font-bold text-foreground" style="font-family: Inter, sans-serif"
		>{value}</span
	>
	<Mono class="text-[9px] text-muted-foreground mt-0.5">{label}</Mono>
</div>
