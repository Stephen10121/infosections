<script lang="ts">
	import { CalendarDays, LayoutList, Image, Eye, Clock } from "@lucide/svelte";
	import { Temporal } from "temporal-polyfill";
	import PrettyDate from "@/PrettyDate.svelte";

	let {
		id,
		logo = null,
		name,
		visits,
		updated,
		type,
		timeZone
	}: {
		id: string;
		logo?: string | null;
		name: string;
		visits: number;
		updated: string;
		type: "calendars" | "image-feeds" | "event-lists";
		timeZone: string;
	} = $props();
</script>

<div class="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
	<div class="flex items-center gap-3 min-w-0">
		<div class="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
			{#if logo !== null && logo !== undefined}
				<img src={logo} alt="{name} logo" class="w-8 h-8 rounded-lg object-cover overflow-hidden" />
			{:else}
				{#if type === "calendars"}
					<CalendarDays class="h-4 w-4 text-violet-400" />
				{:else if type === "event-lists"}
					<LayoutList class="h-4 w-4 text-emerald-400" />
				{:else if type === "image-feeds"}
					<Image class="h-4 w-4 text-amber-400" />
				{/if}
			{/if}
		</div>
		<div class="min-w-0">
			<a
				href="/dashboard/{type}/{id}"
				class="text-sm font-medium text-foreground truncate underline">{name}</a
			>
			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<span class="flex items-center gap-1">
					<Eye class="h-3 w-3" />
					{visits}
				</span>
				<span class="flex items-center gap-1">
					<Clock class="h-3 w-3" />
					<PrettyDate date={Temporal.Instant.from(updated).toZonedDateTimeISO(timeZone)} />
				</span>
			</div>
		</div>
	</div>
</div>
