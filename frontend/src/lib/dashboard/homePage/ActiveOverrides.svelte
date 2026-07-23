<script lang="ts">
	import { timeRemaining, type DynamicURLModel } from "@/utils.js";
	import { AlertTriangle } from "@lucide/svelte";
	import Mono from "@/components/Mono.svelte";

	const {
		myDynamicURLs
	}: {
		myDynamicURLs: DynamicURLModel[];
	} = $props();

	let activeOverrides = $derived(
		myDynamicURLs.filter((u) => u.enableOverrideRedirect && u.overrideRedirectTo)
	);
</script>

{#if activeOverrides.length > 0}
	<div class="px-6 py-4 border-b border-orange-500/20 bg-orange-500/5 flex items-start gap-3">
		<AlertTriangle size={15} class="text-orange-500 shrink-0 mt-0.5" />
		<div class="flex-1 min-w-0">
			<div
				class="text-xs font-semibold text-foreground mb-2"
				style="font-family: Inter, sans-serif"
			>
				{activeOverrides.length} active URL override{activeOverrides.length > 1 ? "s" : ""}
			</div>
			{#each activeOverrides as u (u.id)}
				<div class="flex items-center gap-3 text-xs mb-1">
					<Mono class="text-[10px] text-orange-500 font-medium">/{u.id}</Mono>
					<Mono class="text-[10px] text-muted-foreground"
						>→ {u.overrideRedirectTo.slice(0, 50)}</Mono
					>
					{#if u.overrideExpiresIn}
						<Mono class="text-[10px] text-orange-400"
							>expires {timeRemaining(u.overrideExpiresIn)}</Mono
						>
					{/if}
				</div>
			{/each}
		</div>
		<a
			href="/dashboard/dynamic-urls"
			class="font-mono text-[10px] tracking-widest border border-orange-500/40 text-orange-500 px-3 py-1.5 hover:bg-orange-500/10 transition-colors cursor-pointer shrink-0"
		>
			MANAGE
		</a>
	</div>
{/if}
