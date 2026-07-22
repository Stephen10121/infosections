<script lang="ts">
	import { getEventsForElist } from "../elistEventFetch.remote.js";
	import { getElistById } from "../elistData.remote.js";
	import EventCard from "@/eventList/EventCard.svelte";
	import { Temporal } from "temporal-polyfill";

	let { data } = $props();

	let elist = $derived(await getElistById(data.id));

	let displaySettings = $derived(elist.displaySettings);

	let timeZone = $state(Temporal.Now.timeZoneId());
	let today = $state(Temporal.Now.zonedDateTimeISO(timeZone).startOfDay());

	let eventIdUsed: string[] = [];

	$effect(() => {
		const observer = new ResizeObserver(() => {
			window.parent.postMessage(
				{ height: document.body.scrollHeight, frameId: "iframe" + data.id },
				"*"
			);
		});

		observer.observe(document.body);

		return () => observer.disconnect();
	});

	// svelte-ignore state_referenced_locally
	let events = (await getEventsForElist(data.id)).filter((event, index) => {
		if (index === 0) {
			eventIdUsed = [];
		}

		if (today.toInstant().epochMilliseconds < new Date(event.startTime).valueOf()) {
			if (elist.filters.hideRecurringEvents) {
				if (!eventIdUsed.includes(event.recEventId)) {
					eventIdUsed.push(event.recEventId);
					return true;
				}
			} else {
				return true;
			}
		} else {
			return false;
		}
	});

	console.log(events);
</script>

<svelte:head>
	<title>{elist.name} | InfoSections</title>
	<meta name="description" content={elist.description} />
</svelte:head>

<main style={displaySettings.setTransparentBackground ? "" : "background: #fff;"}>
	<div class="mx-auto">
		{#if displaySettings.showUpcomingEventsTextAndDesc}
			<div class="mb-3">
				<h1 class="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
					Upcoming Events
				</h1>
				<p class="mt-2 text-pretty text-muted-foreground">
					Browse our schedule and register for events that interest you
				</p>
			</div>
		{/if}

		<div class="flex flex-col gap-4">
			{#each events as event, index (`anEvent${event.id}`)}
				<EventCard {event} {timeZone} {displaySettings} reverse={(index & 1) === 1} />
			{/each}
		</div>
	</div>
</main>

<style>
	:global(body) {
		background: none transparent;
	}

	:global(::-webkit-scrollbar) {
		width: 10px;
	}

	:global(::-webkit-scrollbar-track-piece) {
		background-color: #fff;
	}

	:global(::-webkit-scrollbar-thumb) {
		background-color: #cbcbcb;
		outline: 2px solid #fff;
		outline-offset: -2px;
		border: 0.1px solid #b7b7b7;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background-color: #909090;
	}
</style>
