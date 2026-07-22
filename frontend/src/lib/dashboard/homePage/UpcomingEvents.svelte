<script lang="ts">
	import { getAllUserEvents } from "../../../routes/(mainWebsite)/dashboard/events.remote";
	import { Calendar, Clock, MapPin } from "@lucide/svelte";
	import * as Card from "@/components/ui/card/index";
	import { Badge } from "@/components/ui/badge";
	import { Temporal } from "temporal-polyfill";
	import { dateRangeOverlaps } from "@/utils";
	import Time from "@/Time.svelte";

	let timeZone = $state(Temporal.Now.timeZoneId());
	let today = $state(Temporal.Now.zonedDateTimeISO(timeZone).startOfDay());
	let nextDay = $derived(today.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));

	let todaysEvents = $derived(
		(await getAllUserEvents()).filter((event) => {
			return dateRangeOverlaps(
				today.toInstant().epochMilliseconds,
				nextDay.toInstant().epochMilliseconds,
				new Date(event.startTime).valueOf(),
				new Date(event.endTime).valueOf()
			);
		})
	);
</script>

<Card.Root class="border-border/50 bg-card">
	<Card.Header class="pb-3">
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="text-base font-semibold text-foreground">{"Today's Events"}</Card.Title>
				<Card.Description class="text-xs">Fetched from Your Integrations</Card.Description>
			</div>
			<Badge variant="secondary" class="text-xs">
				{todaysEvents.length} event{#if todaysEvents.length !== 1}s{/if}
			</Badge>
		</div>
	</Card.Header>
	<Card.Content>
		{#if todaysEvents.length > 0}
			<div class="space-y-3">
				{#each todaysEvents as event (`atodayevent${event.id}`)}
					<div
						class="flex items-start gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
					>
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"
						>
							<Calendar class="h-5 w-5 text-primary" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2">
								<div>
									<h4 class="text-sm font-medium text-foreground">{event.name}</h4>
									{#if event.location}
										<p class="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
											<MapPin class="h-3 w-3" />
											{event.location}
										</p>
									{/if}
								</div>
								{#if event.expand.tags}
									<div class="flex gap-0.5">
										{#each event.expand.tags as tag (`aneventtag${tag.name}`)}
											<Badge
												variant="outline"
												class="text-[10px] shrink-0"
												style="border-color: {tag.color}; color: {tag.color}"
											>
												{tag.name}
											</Badge>
										{/each}
									</div>
								{/if}
							</div>
							<p class="text-xs text-muted-foreground flex items-center gap-1 mt-2">
								<Clock class="h-3 w-3" />
								<Time
									date={Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone)}
									useAMPM
								/> -
								<Time
									date={Temporal.Instant.from(event.endTime).toZonedDateTimeISO(timeZone)}
									useAMPM
								/>
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-8 text-center">
				<div class="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
					<Calendar class="h-6 w-6 text-muted-foreground" />
				</div>

				<h4 class="text-sm font-medium text-foreground">No Events Today</h4>

				<p class="text-xs text-muted-foreground mt-1 max-w-xs">
					You haven't created any events for today. Go to your integrations and create an event.
				</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
