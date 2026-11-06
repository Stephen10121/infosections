<script lang="ts">
	import Mono from "@/components/Mono.svelte";
	import type { AServiceDBModel } from "@/service.util";
	import { motion } from "@humanspeak/svelte-motion";
	import { Pencil, Trash2 } from "@lucide/svelte";

	let {
		item,
		onEdit,
		onDelete,
		pb_url
	}: { item: AServiceDBModel; onEdit: () => unknown; onDelete: () => unknown; pb_url: string } =
		$props();
</script>

<motion.div
	initial={{ opacity: 0, y: 8 }}
	animate={{ opacity: 1, y: 0 }}
	class="border border-border bg-background group hover:border-primary/50 transition-colors"
>
	<div class="flex items-start gap-4 p-4">
		<div
			class="w-10 h-10 shrink-0 border border-border overflow-hidden bg-muted flex items-center justify-center"
		>
			{#if item.logo !== null && item.logo !== undefined && item.logo.length > 0}
				<img
					src="{pb_url}/api/files/{item.collectionId}/{item.id}/{item.logo}"
					alt={item.name}
					class="w-full h-full object-cover"
				/>
			{:else}
				<div
					class="w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground bg-muted"
				>
					{item.name.slice(0, 2).toUpperCase()}
				</div>
			{/if}
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-0.5">
				<Mono class="text-[12px] font-semibold text-foreground truncate">{item.name}</Mono>
				<span
					class="text-[9px] font-mono px-1.5 py-0.5 bg-orange-500/10 text-orange-500 shrink-0 leading-none"
					>PC LINKED</span
				>
			</div>
			{#if item.description}
				<Mono class="text-[10px] text-muted-foreground block truncate">{item.description}</Mono>
			{/if}
			<div class="flex items-center gap-4 mt-2">
				<Mono class="text-[9px] text-muted-foreground">{item.views} views</Mono>
				<Mono class="text-[9px] text-muted-foreground">{item.prints} prints</Mono>
				<Mono class="text-[9px] text-muted-foreground">{item.shares} shares</Mono>
			</div>
		</div>
		<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
			<button
				onclick={onEdit}
				class="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
			>
				<Pencil size={11} />
			</button>
			<button
				onclick={onDelete}
				class="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors cursor-pointer"
			>
				<Trash2 size={11} />
			</button>
		</div>
	</div>
</motion.div>
