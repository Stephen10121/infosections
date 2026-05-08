<script lang="ts">
    import { CalendarPlus, ClipboardClock, Clock, MapPin } from "@lucide/svelte";
    import { type CalendarCustomizations } from "./cal.utils";
    import { type EventDBModelExpanded } from "./event.utils";
    import EventResources from "./EventResources.svelte";
    import EventTimes from "./EventTimes.svelte";
    import { Temporal } from "temporal-polyfill";
    import { MONTHTOSTRING } from "./utils";
    import Time from "./Time.svelte";

    let { event, currentDay, calendarCustomizations, timeZone, fontScale }: { event: EventDBModelExpanded, currentDay: Temporal.ZonedDateTime, calendarCustomizations: CalendarCustomizations, timeZone: Temporal.TimeZoneLike, fontScale: number } = $props();

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
        <h3 class="dark font-semibold text-white pr-2" style="font-size: {fontScale * 18}px;">{event.name}</h3>
        <p class="dark text-gray-400" style="white-space: nowrap;font-size: {fontScale * 14}px;">{#if EVENT_DAY_NUMBER !== 1}{MONTHTOSTRING[start.month]} {start.day}, {/if} <Time date={start} useAMPM={calendarCustomizations.useAMPM} /></p>
    </div>

    {#if event.description && calendarCustomizations.showDescription}
        <p class="text-gray-300 leading-relaxed" style="font-size: {fontScale * 14}px;">{event.description}</p>
    {/if}
    
    <div class="flex items-center gap-2 text-gray-400" style="font-size: {fontScale * 14}px;">
        <Clock class="h-4 w-4" />
        {#if MULTI_DAY_EVENT}
            <span class="text-gray-300">{MONTHTOSTRING[start.month]} {start.day}, <Time date={start} useAMPM={calendarCustomizations.useAMPM} /> - {MONTHTOSTRING[end.month]} {end.day}, <Time date={end} useAMPM={calendarCustomizations.useAMPM} /></span>
        {:else}
            <span class="text-gray-300"><Time date={start} useAMPM={calendarCustomizations.useAMPM} /> - {#if hours === 24 && start.hour === 0}{MONTHTOSTRING[end.month]} {end.day}, {/if} <Time date={end} useAMPM={calendarCustomizations.useAMPM} /></span>
        {/if}
    </div>

    {#if MULTI_DAY_EVENT}
        <div class="flex items-center gap-2 text-gray-400" style="font-size: {fontScale * 14}px;">
            <CalendarPlus class="h-4 w-4" />
            <span class="text-gray-300">Multi-day event - Day {EVENT_DAY_NUMBER}</span>
        </div>
    {/if}

    <EventResources resources={event.expand.resources} showResourcePathname={calendarCustomizations.showResourcePathname} showRooms={calendarCustomizations.showRooms} showResources={calendarCustomizations.showResources} {fontScale} />

    {#if event.times && event.times.length > 1}
        <div class="mb-3 flex items-start gap-2 text-gray-400" style="font-size: {fontScale * 14}px;">
            <ClipboardClock class="h-4 w-4 mt-0.5 shrink-0" />
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
        <div class="flex items-start gap-2 text-gray-400" style="font-size: {fontScale * 14}px;">
            <MapPin class="h-4 w-4 mt-0.5 shrink-0" />
            <p>
                <span class="text-gray-400">Location:</span>
                <span class="text-gray-300">{#if calendarCustomizations.onlyShowLocationTitle}{event.location.split(" - ")[0]}{:else}{event.location}{/if}</span>
            </p>
        </div>
    {/if}

    {#if event.expand.tags}
        <div class="flex h-fit gap-2">
            {#each event.expand.tags as tag (`taglist${tag.tag_id}${event.id}`)}
                <div style="background-color: #ffffff;word-wrap:break-word;white-space: nowrap;text-overflow: ellipsis;" class="rounded">
                    <span class="rounded px-2 py-1 font-medium" style="font-size: {fontScale * 12}px;background-color: {tag.color}cc;border: 1px solid {tag.color};color: {getContrastYIQ(tag.color)};">
                        {tag.name}
                    </span>
                </div>
            {/each}
        </div>
    {/if}
</div>