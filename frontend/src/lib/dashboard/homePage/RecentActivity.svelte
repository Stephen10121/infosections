<script lang="ts">
	import { cn, timeAgo, type EventListDBModel, type ImageFeedDBModel } from "@/utils";
	import NoEventListAvatar from "@/NoEventListAvatar.svelte";
	import NoImageFeedAvatar from "@/NoImageFeedAvatar.svelte";
	import NoCalendarAvatar from "@/NoCalendarAvatar.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import { type CalendarDBModel } from "@/cal.utils";
	import Mono from "@/components/Mono.svelte";
	import { Eye } from "@lucide/svelte";
	import { motion } from "@humanspeak/svelte-motion";

	const {
		myCalendars,
		myImageFeeds,
		myEventLists,
		pb_url
	}: {
		myCalendars: CalendarDBModel[];
		myImageFeeds: ImageFeedDBModel[];
		myEventLists: EventListDBModel[];
		pb_url: string;
	} = $props();

	type ActivityType = {
		type: "calendars" | "image-feeds" | "event-lists";
	};

	const recentActivity = $derived(
		[
			...(myCalendars.map((cal) => {
				return { ...cal, type: "calendars" };
			}) as (CalendarDBModel & ActivityType)[]),
			...(myImageFeeds.map((feed) => {
				return { ...feed, type: "image-feeds" };
			}) as (ImageFeedDBModel & ActivityType)[]),
			...(myEventLists.map((list) => {
				return { ...list, type: "event-lists" };
			}) as (EventListDBModel & ActivityType)[])
		]
			.sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated))
			.slice(0, 10)
	);

	const typeConfig = {
		calendars: { icon: NoCalendarAvatar, naming: "name", bgColor: "bg-violet-500/10" },
		"event-lists": { icon: NoEventListAvatar, naming: "name", bgColor: "bg-emerald-500/10" },
		"image-feeds": { icon: NoImageFeedAvatar, naming: "name", bgColor: "bg-amber-500/10" }
	};
</script>

<div class="border-r border-border">
	<div class="px-6 py-3 border-b border-border flex items-center justify-between">
		<FieldLabel>PUBLISHED SECTIONS</FieldLabel>
	</div>
	<div>
		{#each recentActivity as activity, i (`aRecentActivity${activity.id}`)}
			{@const meta = typeConfig[activity.type]}
			<motion.a
				key={i}
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: i * 0.03 }}
				href="/dashboard/{activity.type}{meta.naming !== 'id'
					? `/${activity.id}`
					: `?expanded=${activity.id}`}"
				class={cn(
					"flex items-center gap-3 px-6 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors alinkrecent",
					i % 2 === 0 ? "bg-card/70" : ""
				)}
			>
				<div class="h-8 w-8 rounded-md {meta.bgColor} flex items-center justify-center shrink-0">
					{#if activity.logo !== null && activity.logo !== undefined && activity.logo.length > 0}
						<img
							src="{pb_url}/api/files/{activity.collectionId}/{activity.id}/{activity.logo}"
							alt="{activity.name} logo"
							class="w-8 h-8 rounded-lg object-cover overflow-hidden"
						/>
					{:else}
						<meta.icon small />
					{/if}
				</div>
				<div class="flex-1 min-w-0">
					<div
						class="text-xs font-medium text-foreground truncate alinkrecent-title"
						style="font-family: Inter, sans-serif"
					>
						{activity.name}
					</div>
					<Mono class="text-[9px] text-muted-foreground">updated {timeAgo(activity.updated)}</Mono>
				</div>
				<div class="flex items-center gap-2 shrink-0">
					<div class="flex items-center gap-1">
						<Eye size={9} class="text-muted-foreground" /><Mono class="text-[9px] text-foreground"
							>{activity.visits}</Mono
						>
					</div>
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
