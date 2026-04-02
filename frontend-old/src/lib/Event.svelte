<script lang="ts">
    import { CalendarPlus, ClipboardClock, Clock, MapPin } from "@lucide/svelte";
    import { MONTHTOSTRING, type CalendarCustomizations, type EventDBModel } from "./utils";
    import EventResources from "./EventResources.svelte";
    import Time from "./Time.svelte";
    import EventTimes from "./EventTimes.svelte";
    import { Temporal } from "temporal-polyfill";

    let { event, currentDay, calendarCustomizations, timeZone }: { event: EventDBModel, currentDay: Temporal.ZonedDateTime, calendarCustomizations: CalendarCustomizations, timeZone: Temporal.TimeZoneLike } = $props();

    const start = $derived(Temporal.Instant.from(event.startTime).toZonedDateTimeISO(timeZone));
    const end = $derived(Temporal.Instant.from(event.endTime).toZonedDateTimeISO(timeZone));

    const hours = $derived(start.until(end, { largestUnit: "hours" }).total({ unit: "hours" }));

    // const EVENT_DAY_NUMBER = $derived(currentDay.getDate() - start.getDate() + 1);

    const EVENT_DAY_NUMBER = $derived(Math.ceil(Math.abs((currentDay ? currentDay.toInstant().epochMilliseconds : 0) - start.startOfDay().toInstant().epochMilliseconds) / (1000 * 60 * 60 * 24)+1));
    const MULTI_DAY_EVENT = $derived(hours === 24 ? start.hour !== 0 : hours > 24);

    function getContrastYIQ(hexColor: string) {
        // Remove '#' if present
        hexColor = hexColor.replace(/^#/, '');

        // Parse r, g, b values
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);

        // YIQ formula
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;

        // Return black or white text
        return yiq >= 128 ? '#000000' : '#FFFFFF';
    }
</script>

<div class="dark rounded-lg bg-foreground p-4 flex flex-col gap-2" style="border: 1px solid #333333">
    <div class="dark flex items-start justify-between">
        <h3 class="dark text-lg font-semibold text-white pr-2">{event.name}</h3>
        <p class="dark text-sm text-gray-400" style="white-space: nowrap;">{#if EVENT_DAY_NUMBER !== 1}{MONTHTOSTRING[start.month]} {start.day}, {/if} <Time date={start} useAMPM={calendarCustomizations.useAMPM} /></p>
    </div>

    {#if event.description && calendarCustomizations.showDescription}
        <p class="text-sm text-gray-300 leading-relaxed">{event.description}</p>
    {/if}
    
    <div class="flex items-center gap-2 text-sm text-gray-400">
        <Clock class="h-4 w-4" />
        {#if MULTI_DAY_EVENT}
            <span class="text-sm text-gray-300">{MONTHTOSTRING[start.month]} {start.day}, <Time date={start} useAMPM={calendarCustomizations.useAMPM} /> - {MONTHTOSTRING[end.month]} {end.day}, <Time date={end} useAMPM={calendarCustomizations.useAMPM} /></span>
        {:else}
            <span class="text-sm text-gray-300"><Time date={start} useAMPM={calendarCustomizations.useAMPM} /> - {#if hours === 24 && start.hour === 0}{MONTHTOSTRING[end.month]} {end.day}, {/if} <Time date={end} useAMPM={calendarCustomizations.useAMPM} /></span>
        {/if}
    </div>

    {#if MULTI_DAY_EVENT}
        <div class="flex items-center gap-2 text-sm text-gray-400">
            <CalendarPlus class="h-4 w-4" />
            <span class="text-gray-300">Multi-day event - Day {EVENT_DAY_NUMBER}</span>
        </div>
    {/if}

    <EventResources resources={event.resources} showResourcePathname={calendarCustomizations.showResourcePathname} showRooms={calendarCustomizations.showRooms} showResources={calendarCustomizations.showResources} />

    {#if event.times && event.times.length > 1}
        <div class="mb-3 flex items-start gap-2 text-sm text-gray-400">
            <ClipboardClock class="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
                <div class="text-gray-400">Time Schedule:</div>
                <div class="text-gray-300">
                    {#each event.times as time, index (`anEventTime${time.name}${event.id}`)}
                        <EventTimes {timeZone} today={currentDay} useAMPM={calendarCustomizations.useAMPM} {time} multiDayEvent={MULTI_DAY_EVENT} />{#if index+1 < event.times.length},<br>{/if}
                    {/each}
                </div>
            </div>
        </div>
    {/if}

    {#if event.location && calendarCustomizations.showLocation}
        <div class="flex items-start gap-2 text-sm text-gray-400">
            <MapPin class="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
                <span class="text-gray-400">Location:</span>
                <span class="text-gray-300">{#if calendarCustomizations.onlyShowLocationTitle}{event.location.split(" - ")[0]}{:else}{event.location}{/if}</span>
            </p>
        </div>
    {/if}

    {#if event.tags}
        <div class="flex h-fit gap-2">
            {#each event.tags as tag (`taglist${tag.id}${event.id}`)}
                <div style="background-color: #ffffff;word-wrap:break-word;white-space: nowrap;text-overflow: ellipsis;" class="rounded">
                    <span class="rounded px-2 py-1 text-xs font-medium" style="background-color: {tag.color}cc;border: 1px solid {tag.color};color: {getContrastYIQ(tag.color)};">
                        {tag.name}
                    </span>
                </div>
            {/each}
        </div>
    {/if}
</div>