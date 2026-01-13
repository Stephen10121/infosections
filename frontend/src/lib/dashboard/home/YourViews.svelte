<script lang="ts">
    import * as Card from "@/components/ui/card/index";
    import { CalendarDays, ImageIcon, LayoutList } from "@lucide/svelte";
    import { Badge } from "@/components/ui/badge";
    import { timeAgo, type CalendarDBModel, type EventListDBModel, type ImageFeedDBModel } from "@/utils";

    let { 
        calendars,
        eventLists,
        imageFeeds,
        pb_url
     }: { 
        calendars: CalendarDBModel[],
        eventLists: EventListDBModel[],
        imageFeeds: ImageFeedDBModel[],
        pb_url: string

     } = $props();
</script>

<Card.Root>
    <Card.Header class="flex flex-row items-center justify-between">
        <div>
            <Card.Title class="text-base font-medium">Your Views</Card.Title>
            <Card.Description>Event lists, Image Feeds, and Calendars you've created</Card.Description>
        </div>
    </Card.Header>
    <Card.Content>
        <div class="space-y-3">
            {#each calendars as calendar (`viewssCal${calendar.id}`)}
                <a href="/dashboard/calendars/{calendar.id}" class="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent">
                    {#if calendar.logo}
                        <div class="relative group">
                            <img
                                src="{pb_url}/api/files/{calendar.collectionId}/{calendar.id}/{calendar.logo}"
                                alt="IFeed Avatar"
                                class="w-10 h-10 rounded-lg object-cover border-2 border-border overflow-hidden"
                            />
                        </div>
                    {:else}
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <CalendarDays class="h-5 w-5 text-violet-500" />
                        </div>
                    {/if}
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h4 class="font-medium truncate underline">{calendar.name}</h4>
                            <Badge variant="secondary" class="text-xs">Calendar</Badge>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {calendar.visits} visits · Updated {timeAgo(calendar.updated)}
                        </p>
                    </div>
                </a>
            {/each}
            {#each eventLists as eventList (`viewssEList${eventList.id}`)}
                <a href="/dashboard/event-lists/{eventList.id}" class="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent">
                    {#if eventList.logo}
                        <div class="relative group">
                            <img
                                src="{pb_url}/api/files/{eventList.collectionId}/{eventList.id}/{eventList.logo}"
                                alt="IFeed Avatar"
                                class="w-10 h-10 rounded-lg object-cover border-2 border-border overflow-hidden"
                            />
                        </div>
                    {:else}
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <LayoutList class="h-5 w-5 text-emerald-500" />
                        </div>
                    {/if}
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h4 class="font-medium truncate underline">{eventList.name}</h4>
                            <Badge variant="secondary" class="text-xs">Event List</Badge>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {eventList.visits} visits · Updated {timeAgo(eventList.updated)}
                        </p>
                    </div>
                </a>
            {/each}
            {#each imageFeeds as imageFeed (`viewssIFeed${imageFeed.id}`)}
                <a href="/dashboard/image-feeds/{imageFeed.id}" class="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent">
                    {#if imageFeed.logo}
                        <div class="relative group">
                            <img
                                src="{pb_url}/api/files/{imageFeed.collectionId}/{imageFeed.id}/{imageFeed.logo}"
                                alt="IFeed Avatar"
                                class="w-10 h-10 rounded-lg object-cover border-2 border-border overflow-hidden"
                            />
                        </div>
                    {:else}
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <ImageIcon class="h-5 w-5 text-amber-500" />
                        </div>
                    {/if}
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h4 class="font-medium truncate underline">{imageFeed.name}</h4>
                            <Badge variant="secondary" class="text-xs">Image Feed</Badge>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {imageFeed.visits} visits · Updated {timeAgo(imageFeed.updated)}
                        </p>
                    </div>
                </a>
            {/each}
        </div>
    </Card.Content>
</Card.Root>