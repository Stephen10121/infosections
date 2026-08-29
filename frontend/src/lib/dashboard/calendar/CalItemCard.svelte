<script lang="ts">
	import type { CalendarDBModel } from "@/cal.utils";
	import Mono from "@/components/Mono.svelte";
	import { Eye, Globe, Lock, Settings, Trash2 } from "@lucide/svelte";
	import { Temporal } from "temporal-polyfill";
	import { motion } from "@humanspeak/svelte-motion";
	import CopyButton from "@/CopyButton.svelte";
	import PrettyDate from "@/PrettyDate.svelte";
	import NoCalendarAvatar from "@/NoCalendarAvatar.svelte";

	let {
		item,
		key,
		onDelete,
		onEdit,
		pb_url
	}: {
		item: CalendarDBModel;
		key: string;
		onDelete: (item: CalendarDBModel) => unknown;
		onEdit: () => unknown;
		pb_url: string;
	} = $props();

	const viewLabels: Record<CalendarDBModel["displaySettings"]["viewType"], string> = {
		"3day": "3-DAY",
		week: "7-DAY",
		month: "MONTH"
	};
</script>

<motion.div
	{key}
	layout
	initial={{ opacity: 0, y: 8 }}
	animate={{ opacity: 1, y: 0 }}
	exit={{ opacity: 0, y: -8 }}
	class="border border-border bg-background hover:bg-card/40 transition-colors group"
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
				<NoCalendarAvatar small />
			{/if}
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 flex-wrap mb-1">
				<Mono class="text-[9px] px-1.5 py-0.5 font-semibold shrink-0 bg-primary/15 text-primary">
					CALENDAR
				</Mono>
				<Mono class="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground shrink-0">
					{viewLabels[item.displaySettings.viewType]}
				</Mono>
				{#if item.passwordEnabled}
					<Lock size={10} class="text-muted-foreground shrink-0" />
				{/if}
			</div>
			<h3
				class="text-sm font-semibold text-foreground truncate"
				style="font-family: Inter, sans-serif"
			>
				{item.name}
			</h3>
			{#if item.description}
				<p
					class="text-xs text-muted-foreground mt-0.5 line-clamp-1"
					style="font-family: Inter, sans-serif"
				>
					{item.description}
				</p>
			{/if}
		</div>

		<div class="hidden sm:flex flex-col items-end gap-1 shrink-0 text-right">
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-1">
					<Eye size={10} class="text-muted-foreground" />
					<Mono class="text-[10px] text-foreground">{item.visits}</Mono>
				</div>
			</div>
			<Mono class="text-[9px] text-muted-foreground"
				><PrettyDate
					date={Temporal.Instant.fromEpochMilliseconds(
						new Date(item.created).getTime()
					).toZonedDateTimeISO(Temporal.Now.timeZoneId())}
				/></Mono
			>
		</div>
	</div>

	<div class="flex items-center gap-0 border-t border-border/50">
		<a
			href="/cal/{item.publicId}"
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-r border-border/50"
		>
			<Globe size={11} /> VIEW
		</a>
		<CopyButton text="https://infosections.com/cal/{item.publicId}" label="SHARE URL" />
		<div class="flex-1"></div>
		<button
			onclick={() => onEdit()}
			class="flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-l border-border/50 cursor-pointer"
		>
			<Settings size={11} /> SETTINGS
		</button>
		<button
			onclick={() => onDelete(item)}
			class="flex items-center gap-1.5 px-4 py-2.5 font-mono text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors border-l border-border/50 cursor-pointer"
		>
			<Trash2 size={11} />
		</button>
	</div>
</motion.div>
