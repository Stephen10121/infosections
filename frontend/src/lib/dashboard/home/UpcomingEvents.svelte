<script lang="ts">
    import { Button } from "@/components/ui/button";
    import * as Card from "@/components/ui/card/index";
    import Time from "@/Time.svelte";
    import { dateRangeOverlaps, type EventDBModel } from "@/utils";
    import { ArrowRight, MapPin, Clock, Calendar } from "@lucide/svelte";
    import { Temporal } from "temporal-polyfill";

    let { events }: { events: EventDBModel[] } = $props();

    let timeZone = $state(Temporal.Now.timeZoneId());
    let today = $state(Temporal.Now.zonedDateTimeISO(timeZone).startOfDay());
    let nextDay = $derived(today.add({ hours: 23, minutes: 59, seconds: 59, milliseconds: 1 }));

    let todaysEvents = $derived(events.filter((event) => {
        return dateRangeOverlaps(today.toInstant().epochMilliseconds, nextDay.toInstant().epochMilliseconds, (new Date(event.startTime)).valueOf(), (new Date(event.endTime)).valueOf())
    }));

    const upcomingEvents = [
        {
            id: 1,
            name: "Sunday Service",
            location: "Main Campus",
            date: "Jan 14, 2026",
            time: "9:00 AM",
        },
        {
            id: 2,
            name: "Youth Group Meeting",
            location: "Youth Building",
            date: "Jan 15, 2026",
            time: "6:30 PM",
        },
        {
            id: 3,
            name: "Community Outreach",
            location: "Downtown Hall",
            date: "Jan 18, 2026",
            time: "10:00 AM",
        },
        {
            id: 4,
            name: "Leadership Training",
            location: "Community Center",
            date: "Jan 20, 2026",
            time: "7:00 PM",
        },
        {
            id: 5,
            name: "Worship Night",
            location: "Main Campus",
            date: "Jan 22, 2026",
            time: "7:00 PM",
        },
    ]
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
    </div>
    </Card.Content>
</Card.Root>