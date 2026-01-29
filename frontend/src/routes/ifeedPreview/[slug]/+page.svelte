<script lang="ts">
    import Autoplay from "embla-carousel-autoplay";
    import * as Carousel from "$lib/components/ui/carousel/index.js";
    import { SquareArrowOutUpRight } from "@lucide/svelte";
    import type { CarouselAPI } from "@/components/ui/carousel/context.js";
    import { AspectRatio } from "@/components/ui/aspect-ratio/index.js";
    import { Temporal } from "temporal-polyfill";
    import Calendar from '@/Calendar.svelte';

    let { data } = $props();

    let displaySettings = $derived(data.displaySettings);

    let timeZone = $state(Temporal.Now.timeZoneId());
    let today = $state(Temporal.Now.zonedDateTimeISO(timeZone).startOfDay());
    let api = $state<CarouselAPI>();
    let debugToggle = $state(false);

    let eventIdUsed: string[] = [];

    let events = $derived(data.events.filter((event, index) => {
        if (index === 0) {
            eventIdUsed = [];
        }
        if (!(!event.featured && data.filters.onlyShowFeatured) && !(!event.visibleInChurchCenter && data.filters.hideUnpublished) && event.imageURL.length > 0) {
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
        } else {
            return false;
        }
    }));

    function parentSentMessage(event: MessageEvent) {
        try {
            if (event.data.call === "displaySettings") {
                displaySettings = JSON.parse(event.data.value);
            } else if (event.data.call === "reloadPage") {
                window.location.reload();
            } else if (event.data.call === "toggleDebug") {
                debugToggle = event.data.value === "1"
            }
        } catch(err) {
            console.log("Failed to recieve date from the parent container");
            console.log(err);
        }
    }

    $effect(() => {
        if (api && displaySettings) {
            api.reInit(undefined, [Autoplay({
                delay: displaySettings.feedDurationMS,
                playOnInit: true,
                stopOnFocusIn: false,
                stopOnInteraction: false,
                stopOnMouseEnter: false,
                stopOnLastSnap: false,
            })]);
        }
    });
</script>

<svelte:head>
    <title>{data.name}</title>
    <link rel="shortcut icon" href={data.logoLink} type="image/x-icon">
    <meta name="description" content={data.description}>
</svelte:head>

<svelte:window onmessage={parentSentMessage} />

<div class="h-screen w-screen">
    <Carousel.Root
        setApi={(emblaApi) => (api = emblaApi)}
        opts={{
            loop: true,
        }}
        plugins={[Autoplay({
            delay: data.displaySettings.feedDurationMS,
            playOnInit: true,
            stopOnFocusIn: false,
            stopOnInteraction: false,
            stopOnMouseEnter: false,
            stopOnLastSnap: false,
        })]}
        class="w-full h-full"
    >
        <Carousel.Content class="w-screen h-screen">
            {#each events as event (`anEvent${event.id}`)}
                <Carousel.Item class="w-screen h-screen">
                    <AspectRatio ratio={16 / 9} class="relative max-w-screen max-h-screen aspect-video centered-div">
                        <img src={event.imageURL} alt={event.name} class="w-full h-full">
                        {#if displaySettings.showEventExtraInfo && (displaySettings.showEventName || (displaySettings.showEventDescription && event.description.length > 0) || (displaySettings.showEventRegistration && event.registrationURL.length !== 0))}
                            <div class="extrastuff overflow-hidden">
                                <div class="info">
                                    {#if displaySettings.showEventName}
                                        <h2 class="text-2xl">{event.name}</h2>
                                    {/if}

                                    {#if displaySettings.showEventDescription && event.description.length > 0}
                                        <p class="text-sm">{event.description}</p>
                                    {/if}

                                    {#if displaySettings.showEventRegistration && event.registrationURL.length !== 0}
                                        <a href={event.registrationURL} class="flex items-center gap-1" target="_blank">
                                            Register Now
                                            <SquareArrowOutUpRight class="h-4 w-4" />
                                        </a>
                                    {/if}
                                </div>
                            </div>
                        {/if}
                        {#if debugToggle}
                            <div class="debugger">
                                <p>Type: Event</p>
                                <p>Id: {event.id}</p>
                                <p>Recurring Id: {event.recEventId}</p>
                                <p>Name: {event.name}</p>
                                <p>Link href: {event.registrationURL}</p>
                            </div>
                        {/if}
                    </AspectRatio>
                </Carousel.Item>
            {/each}
            {#each data.customEvents as customImage (`anCustomImage${customImage.id}`)}
                <Carousel.Item class="w-screen h-screen">
                    <AspectRatio ratio={16 / 9} class="relative max-w-screen max-h-screen aspect-video centered-div">
                        <img src="{data.apiServer}api/files/{customImage.collectionId}/{customImage.id}/{customImage.picture}" alt={customImage.name} class="w-full h-full">
                        {#if displaySettings.showEventExtraInfo && (displaySettings.showEventRegistration && customImage.showLink && customImage.registrationURL.length !== 0)}
                            <div class="extrastuff overflow-hidden">
                                <div class="info">
                                    <a href={customImage.registrationURL} class="flex items-center gap-1" target="_blank">
                                        {customImage.linkText}
                                        <SquareArrowOutUpRight class="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        {/if}
                        {#if debugToggle}
                            <div class="debugger">
                                <p>Type: Custom Image</p>
                                <p>Id: {customImage.id}</p>
                                <p>Show Link: {customImage.showLink}</p>
                                <p>Link href: {customImage.registrationURL}</p>
                            </div>
                        {/if}
                    </AspectRatio>
                </Carousel.Item>
            {/each}
            {#if data.additionalCalendars}
                {#each data.additionalCalendars as additionalCalendar (`anAdditionalCalendar${additionalCalendar.id}`)}
                    <Carousel.Item class="w-screen h-screen">
                        <AspectRatio ratio={16 / 9} class="relative max-w-screen max-h-screen aspect-video centered-div">
                            <div id="cal-root" class="dark min-h-screen w-full p-6 bg-background relative">
                                <Calendar autoUpdate={false} events={data.events} displaySettings={additionalCalendar.displaySettings} timeZone={timeZone} filters={additionalCalendar.filters} />
                            </div>
                            {#if debugToggle}
                            <div class="debugger">
                                <p>Type: Calendar</p>
                                <p>Id: {additionalCalendar.id}</p>
                            </div>
                        {/if}
                        </AspectRatio>
                    </Carousel.Item>
                {/each}
            {/if}
        </Carousel.Content>
    </Carousel.Root>
</div>

<style>
    :global(*) {
        box-sizing: border-box;
        /* Standard property */
        user-drag: none;
        /* WebKit (Chrome, Safari, newer Opera) */
        -webkit-user-drag: none;
        /* Firefox (older versions) */
        -moz-user-drag: none;
        /* Internet Explorer (older versions) */
        -ms-user-drag: none;
        -webkit-user-select: none; /* Safari */
        user-select: none; /* Standard syntax */
    }

    :global(body) {
        margin: 0;
        padding: 0;
        background:none transparent;
    }

    :global(.centered-div) {
        margin: 0 auto;
        position: absolute;
        max-width: 100vw;
        max-height: 100vh;
        width: calc(min(100vw, 100vh * 16 / 9));
        height: calc(min(100vh, 100vw * 9 / 16));
    }

    .extrastuff {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background: linear-gradient(180deg,rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 82%, rgba(0, 0, 0, 1) 100%) !important;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: 10px;
    }

    .debugger {
        padding: 10px;
        position: absolute;
        top: 0;
        right: 0;
        background-color: #000000b6;
        color: white;
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .extrastuff h2,
    .extrastuff p,
    .extrastuff a {
        color: #ffffff;
        font-family: "Geist", sans-serif;
    }

    .extrastuff a {
        margin-top: 5px;
        border: 1px solid #ffffff;
        width: fit-content;
        padding: 5px;
    }
</style>