<script lang="ts">
    import type { ImageListCustomizations } from "@/utils";
	import Badge from "@/components/ui/badge/badge.svelte";
    import type { EventDBModel } from "@/event.utils";
    import { Button } from "@/components/ui/button";
    import PrettyDate from "@/PrettyDate.svelte";
    import { Temporal } from "temporal-polyfill";
	import { Calendar } from "@lucide/svelte";

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

    // svelte-ignore state_referenced_locally
    console.log(event);
    $inspect(event);
</script>

<div class="card {displaySettings.displayStyle} {reverse ? "reverse" : ""}">
        <div class="img-parent">
            <img src={event.imageURL} alt={event.name}>
        </div>

        <div class="content-parent">
            {#if displaySettings.displayStyle === "expanded" && event.featured}
                <Badge class="mb-4">FEATURED EVENT</Badge>
            {/if}

            {#if displaySettings.showEventName}
                <h2 class="text-balance text-2xl text-center font-light tracking-tight text-card-foreground">{event.name}</h2>
            {/if}

            <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <p class="mt-3 flex gap-3 items-center">
                    {#if displaySettings.displayStyle === "expanded"}
                        <Calendar class="w-5 h-5" />
                    {/if}
                    <PrettyDate date={Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone)} />
                </p>
            </div>

            {#if event.description && displaySettings.showEventDescription}
                <p class="event-description text-pretty leading-relaxed text-muted-foreground mt-3">{event.description}</p>
            {/if}

            {#if event.registrationURL && displaySettings.showEventRegistration}
                <div class="buttonparent{displaySettings.displayStyle} mt-2">
                    <Button class="button{displaySettings.displayStyle} w-full md:w-auto rounded-none font-light" variant="default" href={event.registrationURL} target="_blank" rel="noopener noreferrer">
                        More Info
                    </Button>
                    <!-- {#if displaySettings.displayStyle === "expanded"}
                        <Button class="sharebutton{displaySettings.displayStyle}" variant="outline">
                            <Share2 />
                        </Button>
                    {/if} -->
                </div>
            <!-- {:else if displaySettings.displayStyle === "expanded"}
                <div class="buttonparent{displaySettings.displayStyle}">
                    <Button class="sharebutton{displaySettings.displayStyle}" variant="outline">
                        <Share2 />
                    </Button>
                </div> -->
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
        background-color: #ffffff;
    }

    .card.expanded {
        background-color: #f3f3f4;
        border: none;
        border-radius: 20px;
        box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    }

    @media screen and (min-width: 850px) {
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
    }

    .card.expanded .content-parent {
        padding: 30px;
        align-items: flex-start;
    }

    .card.expanded h2 {
        font-weight: bold;
    }

    .card:not(.expanded) .event-description {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
    }

    .event-description {
        width: 100%;
    }

    .buttonparentexpanded {
        margin-top: 20px;
        display: flex;
        gap: 10px;
    }

    :global(.buttonexpanded) {
        background-color: #000000;
        border-radius: 10px;
        font-weight: bold;
        width: 150px;
        height: 40px;
        letter-spacing: 0.15ch;
    }

    :global(.sharebuttonexpanded) {
        border-radius: 100%;
        height: 40px;
        width: 40px;
    }
</style>