<script lang="ts">
	import FieldLabel from "./FieldLabel.svelte";

	let { fig, label, sheet }: { fig: string; label: string; sheet: string } = $props();
</script>

<div class="px-6 py-2 flex items-center justify-between border-b border-border bg-card/60">
	<FieldLabel>{fig} · {label}</FieldLabel>
	<FieldLabel>{sheet}</FieldLabel>
</div>
