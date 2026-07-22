<script lang="ts">
	import {
		timeAgo,
		type DynamicURLModel,
		type EventListDBModel,
		type ImageFeedDBModel
	} from "@/utils";
	import NoEventListAvatar from "@/NoEventListAvatar.svelte";
	import NoImageFeedAvatar from "@/NoImageFeedAvatar.svelte";
	import DynamicFeedAvatar from "@/DynamicFeedAvatar.svelte";
	import NoCalendarAvatar from "@/NoCalendarAvatar.svelte";
	import { type CalendarDBModel } from "@/cal.utils";
	import * as Card from "@/components/ui/card/index";
	import { Button } from "@/components/ui/button";
	import { ArrowUpRight } from "@lucide/svelte";

	const {
		myCalendars,
		myImageFeeds,
		myEventLists,
		myDynamicURLs,
		pb_url
	}: {
		myCalendars: CalendarDBModel[];
		myImageFeeds: ImageFeedDBModel[];
		myEventLists: EventListDBModel[];
		myDynamicURLs: DynamicURLModel[];
		pb_url: string;
	} = $props();

	type ActivityType = {
		type: "calendars" | "image-feeds" | "event-lists" | "dynamic-urls";
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
			}) as (EventListDBModel & ActivityType)[]),
			...(myDynamicURLs.map((url) => {
				return { ...url, type: "dynamic-urls" };
			}) as (DynamicURLModel & ActivityType)[])
		]
			.sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated))
			.slice(0, 10)
	);

	const typeConfig = {
		calendars: { icon: NoCalendarAvatar, naming: "name", bgColor: "bg-violet-500/10" },
		"event-lists": { icon: NoEventListAvatar, naming: "name", bgColor: "bg-emerald-500/10" },
		"image-feeds": { icon: NoImageFeedAvatar, naming: "name", bgColor: "bg-amber-500/10" },
		"dynamic-urls": { icon: DynamicFeedAvatar, naming: "id", bgColor: "bg-pink-500/10" }
	};
</script>

<Card.Root class="border-border/50 bg-card">
	<Card.Header class="pb-3">
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="text-base font-semibold text-foreground">Recent Activity</Card.Title>
				<Card.Description class="text-xs">Latest updates across your views</Card.Description>
			</div>
			<!-- <Button variant="ghost" size="sm" class="h-8 text-xs" href="/dashboard/analytics">
                View All
                <ArrowUpRight class="h-3 w-3 ml-1" />
            </Button> -->
		</div>
	</Card.Header>
	<Card.Content>
		<div class="space-y-1">
			{#each recentActivity as activity (`aRecentActivity${activity.id}`)}
				{@const config = typeConfig[activity.type]}
				<div
					class="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
				>
					<div class="flex items-center gap-3 min-w-0">
						<div
							class="h-8 w-8 rounded-md {config.bgColor} flex items-center justify-center shrink-0"
						>
							{#if activity.logo !== null && activity.logo !== undefined && activity.logo.length > 0}
								<img
									src="{pb_url}/api/files/{activity.collectionId}/{activity.id}/{activity.logo}"
									alt="{activity.name} logo"
									class="w-8 h-8 rounded-lg object-cover overflow-hidden"
								/>
							{:else}
								<config.icon small />
							{/if}
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-foreground truncate">
								{#if config.naming === "id"}/go/{/if}{activity[config.naming]}
							</p>
							<p class="text-xs text-muted-foreground">
								{timeAgo(activity.updated)}
							</p>
						</div>
					</div>
					<div class="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
						<Button
							variant="ghost"
							size="sm"
							class="h-8 text-xs"
							href="/dashboard/{activity.type}{config.naming !== 'id'
								? `/${activity.id}`
								: `?expanded=${activity.id}`}"
							title="View Details"
						>
							<ArrowUpRight class="h-3 w-3" />
						</Button>
						<!-- <Eye class="h-3.5 w-3.5" />
                        <span class="font-medium text-foreground">{activity.visits}</span>
                        <span class="text-xs">{activity.action === "clicked" ? "clicks" : "views"}</span> -->
					</div>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
