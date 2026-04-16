<script lang="ts">
    import type { ImageListCustomizations } from "@/utils";
    import type { EventDBModel } from "@/event.utils";
    import { Button } from "@/components/ui/button";
    import PrettyDate from "@/PrettyDate.svelte";
    import { Temporal } from "temporal-polyfill";

    let {
        event,
        timeZone,
        displaySettings,
        reverse = false
    }: {
        event: EventDBModel,
        timeZone: string,
        displaySettings: ImageListCustomizations,
        reverse?: boolean
    } = $props();
</script>

<div class="card {reverse ? "reverse" : ""}">
        <div class="img-parent">
            <img src={event.imageURL} alt={event.name}>
        </div>

        <div class="content-parent">
            {#if displaySettings.showEventName}
                <h2 class="text-balance text-2xl text-center font-light tracking-tight text-card-foreground">{event.name}</h2>
            {/if}

            <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <p class="mt-0.5"><PrettyDate date={Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone)} /></p>
            </div>

            {#if event.description && displaySettings.showEventDescription}
                <p class="event-description text-pretty leading-relaxed text-muted-foreground px-1">{event.description}</p>
            {/if}

            {#if event.registrationURL && displaySettings.showEventRegistration}
                <div class="mt-2">
                    <Button class="w-full md:w-auto rounded-none font-light" variant="default">
                        <a href={event.registrationURL} target="_blank" rel="noopener noreferrer">Register Now</a>
                    </Button>
                </div>
            {/if}
        </div>
</div>

<style>
    .card {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 61fr 39fr;
        overflow: hidden;
        border: 1px solid #000000;
        grid-template-areas: 
        "image"
        "content";
    }

    @media screen and (min-width: 600px) {
        .card {
            grid-template-columns: 61fr 39fr;
            grid-template-rows: 1fr;
            grid-template-areas: "image content";
        }

        .card.reverse {
            grid-template-areas: "content image";
            grid-template-columns: 39fr 61fr;
        }
    }

    .img-parent {
        grid-area: image;
        width: 100%;
        aspect-ratio: 16 / 9;
        position: relative;
        overflow: hidden;
        min-width: 0; 
        min-height: 0;
    }

    .img-parent img {
        height: 100%;
        width: 100%;
        position: absolute;
        transition: transform 0.6s ease 10ms;
        transform: scale(1.01);
    }

    .card:hover .img-parent img {
        transform: scale(1.1);
    }

    .content-parent {
        grid-area: content;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        row-gap: 3px;
        min-width: 0;
        min-height: 0;
        background-color: #ffffff;
    }

    .event-description {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }
</style>