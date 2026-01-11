<script lang="ts">
    import { Button } from "@/components/ui/button";
    import * as Card from "@/components/ui/card/index";
    import PrettyDate from "@/PrettyDate.svelte";
    import type { EventDBModel, ImageListCustomizations } from "@/utils";
    import { Calendar } from "@lucide/svelte";
    import { Temporal } from "temporal-polyfill";

    let { event, timeZone, displaySettings }: { event: EventDBModel, timeZone: string, displaySettings: ImageListCustomizations } = $props();
</script>

<Card.Root class="overflow-hidden transition-shadow hover:shadow-lg py-2">
    <div class="flex flex-row">
        <div class="relative aspect-video max-w-60 flex items-center justify-middle">
            <img src={event.imageURL} alt={event.name} class="w-full aspect-video">
        </div>

        <div class="flex flex-1 flex-col justify-between gap-4 p-6">
            <div class="space-y-2">
                {#if displaySettings.showEventName}
                    <h2 class="text-balance text-xl font-semibold tracking-tight text-card-foreground">{event.name}</h2>
                {/if}

                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar class="h-4 w-4" />
                    <p class="mt-0.5"><PrettyDate date={Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone)} /></p>
                </div>

                {#if event.description && displaySettings.showEventDescription}
                    <p class="text-pretty leading-relaxed text-muted-foreground">{event.description}</p>
                {/if}
            </div>

            {#if event.registrationURL && displaySettings.showEventRegistration}
                <div>
                    <Button class="w-full md:w-auto">
                        <a href={event.registrationURL} target="_blank" rel="noopener noreferrer">Register Now</a>
                    </Button>
                </div>
            {/if}
        </div>
    </div>
</Card.Root>