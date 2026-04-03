<script lang="ts">
    import { type CalendarDBModel, type DynamicURLModel, type EventListDBModel, type ImageFeedDBModel } from "@/utils";
    import { CalendarDays, LayoutList, Image, Link2 } from "@lucide/svelte";
    import DynamicUrlItem from "./DynamicUrlItem.svelte";
    import { Button } from "@/components/ui/button";
    import FeatureCard from "./FeatureCard.svelte";
    import ViewItem from "./ViewItem.svelte";

    const {
        myCalendars,
        myImageFeeds,
        myEventLists,
        myDynamicURLs,
        timeZone,
        pb_url
    }: {
        myCalendars: CalendarDBModel[],
        myImageFeeds: ImageFeedDBModel[],
        myEventLists: EventListDBModel[],
        myDynamicURLs: DynamicURLModel[],
        timeZone: string,
        pb_url: string
    } = $props();

</script>

<section class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-foreground">Your Features</h3>
    </div>
    
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
            title="Calendars"
            description="Display events on customizable calendars"
            icon={CalendarDays}
            accent="text-violet-400"
            bgAccent="bg-violet-500/10"
            href="/dashboard/calendars"
            class="lg:row-span-2"
        >
            <div class="space-y-1">
                {#each myCalendars as calendar (`mycal${calendar.id}`)}
                    <ViewItem
                        id={calendar.id}
                        {timeZone}
                        logo={calendar.logo ? `${pb_url}/api/files/${calendar.collectionId}/${calendar.id}/${calendar.logo}` : null}
                        name={calendar.name}
                        visits={calendar.visits}
                        updated={calendar.updated}
                        type="calendars"
                    />
                {/each}
            </div>
            <Button variant="outline" size="sm" class="w-full mt-4 border-border/50 hover:bg-secondary" href="/dashboard/calendars?new=1">
                Create New Calendar
            </Button>
        </FeatureCard>

        <FeatureCard
            title="Event Lists"
            description="Curated lists of upcoming events"
            icon={LayoutList}
            accent="text-emerald-400"
            bgAccent="bg-emerald-500/10"
            href="/dashboard/event-lists"
        >
            <div class="space-y-1">
                {#each myEventLists as list (`alist${list.id}`)}
                    <ViewItem
                        id={list.id}
                        {timeZone}
                        logo={list.logo ? `${pb_url}/api/files/${list.collectionId}/${list.id}/${list.logo}` : null}
                        name={list.name}
                        visits={list.visits}
                        updated={list.updated}
                        type="event-lists"
                    />
                {/each}
            </div>
            <Button variant="outline" size="sm" class="w-full mt-4 border-border/50 hover:bg-secondary" href="/dashboard/event-lists?new=1">
                Create New List
            </Button>
        </FeatureCard>

        <FeatureCard
            title="Image Feeds"
            description="Slideshow carousels for displays"
            icon={Image}
            accent="text-amber-400"
            bgAccent="bg-amber-500/10"
            href="/dashboard/image-feeds"
        >
            <div class="space-y-1">
                {#each myImageFeeds as feed (`afeed${feed.id}`)}
                    <ViewItem
                        id={feed.id}
                        {timeZone}
                        logo={feed.logo ? `${pb_url}/api/files/${feed.collectionId}/${feed.id}/${feed.logo}` : null}
                        name={feed.name}
                        visits={feed.visits}
                        updated={feed.updated}
                        type="image-feeds"
                    />
                {/each}
            </div>
            <Button variant="outline" size="sm" class="w-full mt-4 border-border/50 hover:bg-secondary">
                Create New Feed
            </Button>
        </FeatureCard>

        <FeatureCard
            title="Dynamic URLs"
            description="Smart redirects with scheduling"
            icon={Link2}
            accent="text-pink-400"
            bgAccent="bg-pink-500/10"
            href="/dashboard/dynamic-urls"
            class="md:col-span-2"
        >
            <div class="grid gap-0 sm:grid-cols-3">
                {#each myDynamicURLs as url (`adurl${url.id}`)}
                    <DynamicUrlItem
                        name={url.id}
                        redirect={307}
                        hits={100}
                    />
                {/each}
            </div>
            <Button variant="outline" size="sm" class="w-full mt-4 border-border/50 hover:bg-secondary" href="/dashboard/dynamic-urls?new=1">
                Create New Dynamic URL
            </Button>
        </FeatureCard>
    </div>
</section>