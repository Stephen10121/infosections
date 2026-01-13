<script lang="ts">
    import MetricCards from '@/dashboard/home/MetricCards.svelte';
    import QuickActions from '@/dashboard/home/QuickActions.svelte';
    import SyncStatus from '@/dashboard/home/SyncStatus.svelte';
    import UpcomingEvents from '@/dashboard/home/UpcomingEvents.svelte';
    import YourViews from '@/dashboard/home/YourViews.svelte';

    let { data } = $props();
</script>

<svelte:head>
    <title>Dashboard | InfoSections</title>
</svelte:head>

<div class="w-full h-full space-y-6">
    <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold text-foreground">Hello {data.user.name}!</h1>
        <p class="text-muted-foreground">Here's an overview of your events and activity.</p>
    </div>

    <MetricCards
        eventAmount={data.events.length}
        eventListAmount={data.eventLists.length}
        imageFeedsAmount={data.imageFeeds.length}
        calendarsAmount={data.calendars.length}
    />

    <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
            <YourViews
                calendars={data.calendars}
                imageFeeds={data.imageFeeds}
                eventLists={data.eventLists}
                pb_url={data.pb_url}
            />
            <UpcomingEvents events={data.events} />
        </div>
        <div>
            <div class="space-y-6" style="position: sticky;top:0px;">
                <QuickActions />
                <SyncStatus
                    lastEventsFetch={data.user.lastEventsFetch}
                    eventsAmount={data.events.length}
                />
            </div>
        </div>
    </div>
</div>