<script lang="ts">
    import EventCard from "@/eventList/EventCard.svelte";
    import { Temporal } from "temporal-polyfill";

    let { data } = $props();

    let displaySettings = $derived(data.displaySettings);

    let timeZone = $state(Temporal.Now.timeZoneId());

    function parentSentMessage(event: MessageEvent) {
        try {
            if (event.data.call === "displaySettings") {
                displaySettings = JSON.parse(event.data.value);
            }
        } catch(err) {
            console.log("Failed to recieve date from the parent container");
            console.log(err);
        }
    }
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
            {#each data.events as event (`anEvent${event.id}`)}
                <EventCard event={event} {timeZone} {displaySettings} />
            {/each}
        </div>
    </div>
</main>

<style>
    main {
        padding: 10px;
    }

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