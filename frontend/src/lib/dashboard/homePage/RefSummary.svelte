<script lang="ts">
	import FieldLabel from "@/components/FieldLabel.svelte";
	import Mono from "@/components/Mono.svelte";
	import type { DynamicURLModel } from "@/utils";

	const { myDynamicURLs }: { myDynamicURLs: DynamicURLModel[] } = $props();

	function getSortedRefs() {
		let allRefs: { [key: string]: number } = {};
		for (let i = 0; i < myDynamicURLs.length; i++) {
			const dynurl = myDynamicURLs[i];
			if (!dynurl) continue;
			for (let b = 0; b < dynurl.refs?.length; b++) {
				const currentRef = dynurl.refs[b];
				if (!currentRef) continue;
				if (Object.keys(allRefs).includes(currentRef.name) && currentRef.name in allRefs) {
					allRefs[currentRef.name]! += currentRef.hits;
				} else {
					allRefs[currentRef.name] = currentRef.hits;
				}
			}
		}

		return Object.fromEntries(Object.entries(allRefs).sort((a, b) => b[1] - a[1]));
	}

	let sortedRefs = $derived(getSortedRefs());
	let maxRef = $derived(sortedRefs[Object.keys(sortedRefs)[0]!]!);
</script>

<div class="px-6 py-5">
	<div class="flex items-center justify-between mb-4">
		<FieldLabel>REF TRAFFIC SUMMARY</FieldLabel>
		<Mono class="text-[10px] text-muted-foreground">across all dynamic URLs</Mono>
	</div>
	{#if Object.keys(sortedRefs).length > 0}
		<div class="grid md:grid-cols-2 gap-2">
			{#each Object.entries(sortedRefs) as [ref, count] (ref)}
				<div class="flex items-center gap-3 py-2 border-b border-border/30 last:border-b-0">
					<Mono class="text-[10px] text-foreground w-24 shrink-0">?ref={ref}</Mono>
					<div class="flex-1 h-1.5 bg-muted overflow-hidden">
						<div class="h-full bg-primary" style="width: {(count / maxRef) * 100}%"></div>
					</div>
					<Mono class="text-[10px] text-foreground w-10 text-right shrink-0"
						>{count.toLocaleString()}</Mono
					>
				</div>
			{/each}
		</div>
	{:else}
		<Mono class="text-[10px] text-muted-foreground">No ref data yet.</Mono>
	{/if}
</div>
