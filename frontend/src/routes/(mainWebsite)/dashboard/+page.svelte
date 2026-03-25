<script lang="ts">
    import { getMyCalendars, getMyImageFeeds, getMyEventLists, getMyDynamicURLS, getAllUserEvents } from './backend.remote.js';
    import UpcomingEvents from '@/dashboard/homePage/UpcomingEvents.svelte';
    import RecentActivity from '@/dashboard/homePage/RecentActivity.svelte';
    import MetricCards from '@/dashboard/homePage/MetricCards.svelte';

    let { data } = $props();

    const [
        myCalendars,
        myImageFeeds,
        myEventLists,
        myDynamicURLs,
        allUserEvents
    ] = $derived(await Promise.all([
        getMyCalendars(),
        getMyImageFeeds(),
        getMyEventLists(),
        getMyDynamicURLS(),
        getAllUserEvents()
    ]));
</script>

<svelte:head>
    <title>Dashboard | InfoSections</title>
</svelte:head>

<div class="w-full h-full">
    <div class="space-y-8">
        <section>
            <h2 class="text-2xl font-bold tracking-tight text-foreground">
                Hello, {data.user.name}!
            </h2>
            <p class="text-muted-foreground mt-1">
                {"Here's an overview of your events and activity."}
            </p>
        </section>

        <MetricCards
            {myCalendars}
            {myDynamicURLs}
            {myEventLists}
            {myImageFeeds}
            {allUserEvents}
        />

        <!-- <FeatureSummary /> -->

        <div class="grid gap-6 lg:grid-cols-3">
            <div class="lg:col-span-2 space-y-6">
                <UpcomingEvents />
                <RecentActivity
                    {myCalendars}
                    {myDynamicURLs}
                    {myEventLists}
                    {myImageFeeds}
                />
            </div>
            <div class="space-y-6">
                <!-- <QuickActions /> -->
                <!-- <IntegrationStatus integration={mockIntegration} eventsAmount={mockMetrics.eventAmount} /> -->
            </div>
        </div>
    </div>
</div>