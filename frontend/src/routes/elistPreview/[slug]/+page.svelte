<script lang="ts">
    import EventCard from "@/eventList/EventCard.svelte";
    import { Temporal } from "temporal-polyfill";

    let { data } = $props();

    let displaySettings = $derived(data.displaySettings);

    let timeZone = $state(Temporal.Now.timeZoneId());
    let today = $state(Temporal.Now.zonedDateTimeISO(timeZone).startOfDay());

    let eventIdUsed: string[] = [];

    function parentSentMessage(event: MessageEvent) {
        try {
            if (event.data.call === "displaySettings") {
                displaySettings = JSON.parse(event.data.value);
            } else if (event.data.call === "reloadPage") {
                window.location.reload();
            }
        } catch(err) {
            console.log("Failed to recieve date from the parent container");
            console.log(err);
        }
    }

    let events = $derived(data.events.filter((event, index) => {
        if (index === 0) {
            eventIdUsed = [];
        }

        if (today.toInstant().epochMilliseconds < (new Date(event.startTime)).valueOf()) {
            if (data.filters.hideRecurringEvents) {
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
    }));
</script>

<svelte:head>
    <title>{data.name}</title>
    <link rel="shortcut icon" href={data.logoLink} type="image/x-icon">
    <meta name="description" content={data.description}>
</svelte:head>

<svelte:window onmessage={parentSentMessage} />

<main style="height: 100vh; {displaySettings.setTransparentBackground ? "" : "background: #fff;"}">
    <div class="mx-auto max-w-4xl">
        {#if displaySettings.showUpcomingEventsTextAndDesc}
            <div class="mb-3">
                <h1 class="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">Upcoming Events</h1>
                <p class="mt-2 text-pretty text-muted-foreground">
                    Browse our schedule and register for events that interest you
                </p>
            </div>
        {/if}
    
        <div class="flex flex-col gap-4">
            {#each events as event, index (`anEvent${event.id}`)}
                <EventCard event={event} {timeZone} {displaySettings} reverse={(index & 1)===1} />
            {/each}
        </div>
    </div>
</main>

<style>
    :global(body) {
        background: none transparent;
    }

    :global(::-webkit-scrollbar){
        width: 10px;
    }

    :global(::-webkit-scrollbar-track-piece){
        background-color: #FFF;
    }

    :global(::-webkit-scrollbar-thumb){
        background-color: #CBCBCB;
        outline: 2px solid #FFF;
        outline-offset: -2px;
        border: .1px solid #B7B7B7;
    }

    :global(::-webkit-scrollbar-thumb:hover){
        background-color: #909090;
    }
</style>