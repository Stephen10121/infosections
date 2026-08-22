<script lang="ts">
	import { Plus } from "@lucide/svelte";
	import Pill from "./Pill.svelte";
	import type { EventResourcesDBModelPrivate } from "@/event.utils";

	let {
		selected,
		options,
		onAdd,
		onRemove,
		placeholder
	}: {
		selected: EventResourcesDBModelPrivate[];
		options: EventResourcesDBModelPrivate[];
		onAdd: (v: EventResourcesDBModelPrivate) => void;
		onRemove: (v: EventResourcesDBModelPrivate) => void;
		placeholder?: string;
	} = $props();

	let input = $state("");
	let open = $state(false);
	const filtered = $derived(
		options.filter((o) => !selected.includes(o) && o.name.includes(input.toLowerCase()))
	);
</script>

<div class="relative">
	<div class="flex flex-wrap gap-1 mb-2">
		{#each selected as t (t)}
			<Pill label={t.name} onRemove={() => onRemove(t)} />
		{/each}
	</div>
	<div class="flex gap-1.5">
		<input
			value={input}
			onchange={(e) => {
				//@ts-ignore
				input = e.target!.value;
				open = true;
			}}
			onfocus={() => (open = true)}
			onblur={() => setTimeout(() => (open = false), 150)}
			placeholder={placeholder || "Add tag..."}
			class="flex-1 border border-border bg-transparent px-2 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
			style="font-family: 'JetBrains Mono', monospace"
		/>
		<button
			type="button"
			onclick={() => {
				if (input.trim() && selected.filter((s) => s.name.includes(input.trim())).length === 0) {
					onAdd(selected.filter((s) => s.name.includes(input.trim()))[0]!);
					input = "";
				}
			}}
			class="border border-border px-2 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
		>
			<Plus size={12} />
		</button>
	</div>
	{#if open && filtered.length > 0}
		<div
			class="absolute top-full left-0 right-0 z-10 border border-border bg-background shadow-lg mt-0.5 max-h-36 overflow-y-auto"
		>
			{#each filtered as o (o)}
				<button
					type="button"
					onmousedown={() => {
						onAdd(o);
						input = "";
						open = false;
					}}
					class="w-full text-left px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
				>
					#{o}
				</button>
			{/each}
		</div>
	{/if}
</div>
