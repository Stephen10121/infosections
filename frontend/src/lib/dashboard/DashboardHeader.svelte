<script lang="ts">
	import { type EventListDBModel, type ImageFeedDBModel } from "@/utils";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import EverythingSearch from "@/EverythingSearch.svelte";
	import { type CalendarDBModel } from "@/cal.utils";
	import { MoonIcon, SunIcon } from "@lucide/svelte";
	import { toggleMode } from "mode-watcher";

	let {
		calendars,
		imageFeeds,
		eventLists
	}: {
		calendars: CalendarDBModel[];
		imageFeeds: ImageFeedDBModel[];
		eventLists: EventListDBModel[];
	} = $props();
</script>

<nav class="bg-background/95 backdrop-blur-sm border-b border-border isolate z-50">
	<div class="w-full px-3 h-12 flex items-center justify-between">
		<div class="flex-1 relative flex items-center gap-3">
			<Sidebar.Trigger
				class="w-8.5 h-8.5 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors cursor-pointer"
			/>
			<EverythingSearch {calendars} {imageFeeds} {eventLists} />
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={toggleMode}
				class="w-8.5 h-8.5 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors cursor-pointer"
			>
				<SunIcon
					size={12}
					class="scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					size={12}
					class="absolute scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
			</button>
		</div>
	</div>
</nav>
