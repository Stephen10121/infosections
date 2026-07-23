<script lang="ts">
	import { Calendar, Eye, Globe, LayoutGrid } from "@lucide/svelte";
	import type { EventDBModelPrivate } from "@/event.utils";
	import type { CalendarDBModel } from "@/cal.utils";
	import { motion } from "@humanspeak/svelte-motion";
	import Mono from "@/components/Mono.svelte";
	import { type DynamicURLModel, type EventListDBModel, type ImageFeedDBModel } from "@/utils.js";

	const {
		myCalendars,
		myImageFeeds,
		myEventLists,
		myDynamicURLs,
		allUserEvents
	}: {
		myCalendars: CalendarDBModel[];
		myImageFeeds: ImageFeedDBModel[];
		myEventLists: EventListDBModel[];
		myDynamicURLs: DynamicURLModel[];
		allUserEvents: EventDBModelPrivate[];
	} = $props();

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

	function getTotalSectionViews() {
		let total = 0;
		for (let i = 0; i < myCalendars.length; i++) {
			const cal = myCalendars[i];
			if (!cal) continue;
			total += cal.visits;
		}
		for (let i = 0; i < myImageFeeds.length; i++) {
			const ifeeds = myImageFeeds[i];
			if (!ifeeds) continue;
			total += ifeeds.visits;
		}
		for (let i = 0; i < myEventLists.length; i++) {
			const elists = myEventLists[i];
			if (!elists) continue;
			total += elists.visits;
		}

		return total;
	}
	let totalSectionViews = $derived(getTotalSectionViews());

	let metrics = $derived([
		{
			label: "Events synced",
			value: allUserEvents.length,
			sub: "from Planning Center",
			icon: Calendar
		},
		{
			label: "Active sections",
			value: myCalendars.length + myImageFeeds.length + myEventLists.length,
			sub: `${myCalendars.length} cal · ${myImageFeeds.length} feed · ${myEventLists.length} list`,
			icon: LayoutGrid
		},
		{
			label: "Section views",
			value: totalSectionViews,
			sub: "across all published sections",
			icon: Eye
		},
		{
			label: "URL clicks",
			value: Object.values(sortedRefs).reduce(
				(accumulator, currentValue) => accumulator + currentValue,
				0
			),
			sub: "*with ref param",
			icon: Globe
		}
	]);
</script>

<div class="grid grid-cols-2 md:grid-cols-4 border-b border-border">
	{#each metrics as { label, value, sub, icon: Icon }, i (i)}
		<motion.div
			key={i}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: i * 0.06 }}
			class="px-6 py-8 border-r border-b md:border-b-0 border-border last:border-r-0 text-left group hover:bg-card/40 transition-colors"
		>
			<div class="flex items-start justify-between mb-2">
				<div
					class="text-3xl font-black text-foreground group-hover:text-primary transition-colors"
					style="font-family: Inter, sans-serif"
				>
					{value}
				</div>
				<Icon
					size={14}
					class="text-muted-foreground group-hover:text-primary transition-colors mt-1"
				/>
			</div>
			<Mono class="text-[10px] text-primary block">{label}</Mono>
			<Mono class="text-[10px] text-muted-foreground mt-0.5 block">{sub}</Mono>
		</motion.div>
	{/each}
</div>
