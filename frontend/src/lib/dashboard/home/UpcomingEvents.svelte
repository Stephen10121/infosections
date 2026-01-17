<script lang="ts">
    import * as Card from "@/components/ui/card/index";
    import Time from "@/Time.svelte";
    import { dateRangeOverlaps, type EventDBModel } from "@/utils";
    import { MapPin, Clock, Calendar, ArrowUpRightIcon } from "@lucide/svelte";
    import { Temporal } from "temporal-polyfill";
    import * as Empty from "$lib/components/ui/empty/index.js";
    import { Button } from "@/components/ui/button";

    let { events }: { events: EventDBModel[] } = $props();

    let timeZone = $state(Temporal.Now.timeZoneId());
    let today = $state(Temporal.Now.zonedDateTimeISO(timeZone).startOfDay());
    let nextDay = $derived(today.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));

    let todaysEvents = $derived(events.filter((event) => {
        return dateRangeOverlaps(today.toInstant().epochMilliseconds, nextDay.toInstant().epochMilliseconds, (new Date(event.startTime)).valueOf(), (new Date(event.endTime)).valueOf())
    }));
</script>

<Card.Root>
    <Card.Header class="flex flex-row items-center justify-between">
        <div>
            <Card.Title class="text-base font-medium">Todays Events</Card.Title>
            <Card.Description>Fetched from Planning Center</Card.Description>
        </div>
    </Card.Header>
    <Card.Content>
    <div class="space-y-3">
        {#if todaysEvents.length > 0}
            {#each todaysEvents as event (`upcomingevent${event.id}`)}
                <div class="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent">
                    <div class="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar class="h-5 w-5" />
                    </div>

                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium truncate">{event.name}</h4>
                        <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {#if event.location}
                                <span class="flex items-center gap-1">
                                    <MapPin class="h-3 w-3" />
                                    {event.location.split("-")[0]}
                                </span>
                            {/if}
                            <span class="flex items-center gap-1">
                                <Clock class="h-3 w-3" />
                                <Time date={Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone)} useAMPM />
                            </span>
                        </div>
                    </div>
                </div>
            {/each}
        {:else}
                <Empty.Root>
                    <Empty.Header>
                        <Empty.Media variant="icon">
                        <Calendar />
                        </Empty.Media>
                        <Empty.Title>No Events Today</Empty.Title>
                        <Empty.Description>
                            You haven't created any events for today. Get started by going to planning center and create an event.
                        </Empty.Description>
                    </Empty.Header>
                    <Empty.Content>
                        <div class="flex gap-2">
                        <Button href="https://calendar.planningcenteronline.com/" target="_blank">Create Event</Button>
                        </div>
                    </Empty.Content>
                    <Button variant="link" class="text-muted-foreground" size="sm">
                        <a href="https://pcocalendar.zendesk.com/hc/en-us/articles/360016189514-Create-an-event" target="_blank">
                        Learn More <ArrowUpRightIcon class="inline" />
                        </a>
                    </Button>
                </Empty.Root>
        {/if}
    </div>
    </Card.Content>
</Card.Root>