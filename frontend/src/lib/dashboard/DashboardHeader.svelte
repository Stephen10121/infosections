<script lang="ts">
    import { type CalendarDBModel, type EventListDBModel, type ImageFeedDBModel } from "@/utils";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import EverythingSearch from "@/EverythingSearch.svelte";
    import { Button } from "@/components/ui/button";
    import { Bell, Settings } from "@lucide/svelte";

    let { calendars, imageFeeds, eventLists }: { calendars: CalendarDBModel[], imageFeeds: ImageFeedDBModel[], eventLists: EventListDBModel[] } = $props();
</script>

<header class="h-16 border-b border-border bg-card">
    <div class="flex h-full items-center gap-4 px-4">
        <div class="flex-1 relative flex items-center gap-4">
            <Sidebar.Trigger class="w-9 h-9" />
            <EverythingSearch {calendars} {imageFeeds} {eventLists} />
        </div>

        <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" class="relative hover:bg-primary buttonHover">
                <Bell class="h-5 w-5" />
                <span class="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-ring"></span>
            </Button>

            <Button variant="ghost" class="hover:bg-primary" size="icon">
                <Settings class="h-5 w-5" />
            </Button>
        </div>
    </div>
</header>

<style>
    :global(.buttonHover:hover span) {
        background-color: rgb(61, 152, 212);
    }
</style>