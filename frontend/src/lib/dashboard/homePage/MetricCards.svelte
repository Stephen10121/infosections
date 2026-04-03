<script lang="ts">
    import { cn, type CalendarDBModel, type DynamicURLModel, type EventDBModelPrivate, type EventListDBModel, type ImageFeedDBModel } from "@/utils";
    import { Calendar, CalendarDays, LayoutList, Image, Link2, Eye } from "@lucide/svelte";
    import * as Card from "@/components/ui/card/index";

    const {
        myCalendars,
        myImageFeeds,
        myEventLists,
        myDynamicURLs,
        allUserEvents
    }: {
        myCalendars: CalendarDBModel[],
        myImageFeeds: ImageFeedDBModel[],
        myEventLists: EventListDBModel[],
        myDynamicURLs: DynamicURLModel[],
        allUserEvents: EventDBModelPrivate[]
    } = $props();

    const totalVisits = $derived(
        myCalendars.map((cal) => cal.visits).reduce((a,b) => a+b, 0) +
        myImageFeeds.map((feed) => feed.visits).reduce((a,b) => a+b, 0) +
        myEventLists.map((elist) => elist.visits).reduce((a,b) => a+b, 0) +
        myDynamicURLs.map((dURL) => dURL.refs.map((aref) => aref.hits).reduce((a,b) => a+b, 0)).reduce((a,b) => a+b, 0)
    );

    const metricConfig = $derived([
        {
            key: "eventAmount" as const,
            name: "Events Synced",
            description: "From Your Integrations",
            icon: Calendar,
            accent: "text-blue-500",
            bgAccent: "bg-blue-500/10",
            value: allUserEvents.length
        },
        {
            key: "calendarsAmount" as const,
            name: "Calendars",
            description: "Created",
            icon: CalendarDays,
            accent: "text-violet-500",
            bgAccent: "bg-violet-500/10",
            value: myCalendars.length
        },
        {
            key: "eventListAmount" as const,
            name: "Event Lists",
            description: "Created",
            icon: LayoutList,
            accent: "text-emerald-500",
            bgAccent: "bg-emerald-500/10",
            value: myEventLists.length
        },
        {
            key: "imageFeedsAmount" as const,
            name: "Image Feeds",
            description: "Created",
            icon: Image,
            accent: "text-amber-500",
            bgAccent: "bg-amber-500/10",
            value: myImageFeeds.length
        },
        {
            key: "dynamicUrlsAmount" as const,
            name: "Dynamic URLs",
            description: "Created",
            icon: Link2,
            accent: "text-pink-400",
            bgAccent: "bg-pink-500/10",
            value: myDynamicURLs.length
        },
        {
            key: "totalVisits" as const,
            name: "Total Visits",
            description: "All Time",
            icon: Eye,
            accent: "text-cyan-400",
            bgAccent: "bg-cyan-500/10",
            value: totalVisits
        },
    ]);
</script>

<div class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
    {#each metricConfig as config (`ametriccard${config.key}`)}
        <Card.Root class="relative overflow-hidden border-border/50 bg-card hover:bg-card/80 transition-colors">
            <Card.Content class="p-4">
                <div class={cn("absolute top-3 right-3 rounded-lg p-2", config.bgAccent)}>
                    <config.icon class={cn("h-4 w-4", config.accent)} />
                </div>
                <div class="space-y-1 pr-10">
                    <p class="text-2xl font-bold text-foreground">{config.value}</p>
                    <p class="text-sm font-medium text-foreground">{config.name}</p>
                    <p class="text-xs text-muted-foreground">{config.description}</p>
                </div>
            </Card.Content>
        </Card.Root>
    {/each}
</div>