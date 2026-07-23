<script lang="ts">
	import FieldLabel from "@/components/FieldLabel.svelte";
	import { cn, type DynamicURLModel } from "@/utils.js";
	import Mono from "@/components/Mono.svelte";
	import { Eye } from "@lucide/svelte";
	import { motion } from "@humanspeak/svelte-motion";

	const { myDynamicURLs }: { myDynamicURLs: DynamicURLModel[] } = $props();
</script>

<div>
	<div class="px-6 py-3 border-b border-border flex items-center justify-between">
		<FieldLabel>DYNAMIC URLS</FieldLabel>
		<a
			href="/dashboard/dynamic-urls"
			class="font-mono text-[9px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
			>VIEW ALL →</a
		>
	</div>
	<div>
		{#each myDynamicURLs as url, i (url.id)}
			<motion.a
				key={i}
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: i * 0.03 + 0.1 }}
				href="/dashboard/dynamic-urls?expanded={url.id}"
				class={cn(
					"flex items-center gap-3 px-6 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors alinkrecent",
					i % 2 === 0 ? "bg-card/10" : ""
				)}
			>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-0.5">
						<div
							class="text-xs font-medium text-foreground truncate alinkrecent-title"
							style="font-family: Inter, sans-serif"
						>
							/{url.id}
						</div>
						{#if url.enableOverrideRedirect}<Mono
								class="text-[8px] bg-orange-500/15 text-orange-500 px-1">OVERRIDE</Mono
							>{/if}
					</div>
					<Mono class="text-[10px] text-primary truncate block">infosections.com/go/{url.id}</Mono>
					<Mono class="text-[9px] text-muted-foreground">{url.timeZone}</Mono>
				</div>
				<div class="flex flex-col items-end gap-1 shrink-0">
					<div class="flex items-center gap-1">
						<Eye size={9} class="text-muted-foreground" /><Mono class="text-[9px] text-foreground"
							>{url.refs
								.map((ref) => ref.hits)
								.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
								.toLocaleString()}</Mono
						>
					</div>
					<Mono
						class={cn(
							"text-[8px] px-1.5 py-0.5",
							!url.disableURL ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
						)}>{!url.disableURL ? "ON" : "OFF"}</Mono
					>
				</div>
			</motion.a>
		{/each}
	</div>
</div>

<style>
	:global(.alinkrecent):hover .alinkrecent-title {
		text-decoration: underline;
	}
</style>
