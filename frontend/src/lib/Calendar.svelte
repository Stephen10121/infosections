<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";
    import Day from "./Day.svelte";
    import type { CalendarCustomizations, CalendarFilters, EventDBModel } from "./utils";
    import { Temporal } from 'temporal-polyfill';

    let {
        events,
        displaySettings,
        timeZone,
        filters,
        autoUpdate = true
    }: {
        events: EventDBModel[],
        displaySettings: CalendarCustomizations,
        timeZone: Temporal.TimeZoneLike,
        filters: CalendarFilters,
        autoUpdate?: boolean
    } = $props();

    let calendarCustomizations: CalendarCustomizations = $derived(displaySettings);

    let today = $state(Temporal.Now.zonedDateTimeISO(timeZone).startOfDay());
    let tomorrow = $state(Temporal.Now.zonedDateTimeISO(timeZone).add({ days: 1 }).startOfDay());
    let thirdDay = $state(Temporal.Now.zonedDateTimeISO(timeZone).add({ days: 2 }).startOfDay());
    let currentTimeZone = $state(timeZone);

    function updatePage() {
        console.log("Updating Page.");
        today = Temporal.Now.zonedDateTimeISO(timeZone).startOfDay();
        tomorrow = Temporal.Now.zonedDateTimeISO(timeZone).add({ days: 1 }).startOfDay();
        thirdDay = Temporal.Now.zonedDateTimeISO(timeZone).add({ days: 2 }).startOfDay();

        invalidateAll();
    }

    $effect(() => {
        if (currentTimeZone !== timeZone) {
            updatePage();
            currentTimeZone = timeZone;
        }
    });

    onMount(() => {
        const updater = autoUpdate ? setInterval(updatePage, 20000) : undefined;

        return () => {
            clearInterval(updater);
        }
    });
</script>

<div class="dark mx-auto">
    <div class="dark grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Day dayNumber={1} events={events} {timeZone} {calendarCustomizations} {filters} day={today} />
        <Day dayNumber={2} events={events} {timeZone} {calendarCustomizations} {filters} day={tomorrow} />
        <Day dayNumber={3} events={events} {timeZone} {calendarCustomizations} {filters} day={thirdDay} />
    </div>
</div>