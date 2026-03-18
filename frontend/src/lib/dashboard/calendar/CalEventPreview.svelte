<script lang="ts">
    import { Temporal } from "temporal-polyfill";
    import Event from "@/Event.svelte";
    import type { CalendarCustomizations } from "@/utils";

    let {
        displaySettings,
        nowDate
    }: {
        displaySettings: CalendarCustomizations,
        nowDate: Temporal.ZonedDateTime
    } = $props();
</script>

<Event calendarCustomizations={displaySettings} event={{
    recurrence: "",
    id: "blankEvent",
    recEventId: "blankRecEvent",
    name: "Event Info Preview",
    location: "Home - 1234 Main Street, Vancouver WA",
    registrationURL: "",
    imageURL: "",
    visibleInChurchCenter: true,
    featured: true,
    description: "This is a short description of this event.",
    times: [],
    resources: [{
        id: "res1",
        kind: "Room",
        name: "Kitchen",
        path_name: ""
    },
    {
        id: "res2",
        kind: "Room",
        name: "Santuary",
        path_name: ""
    },
    {
        id: "res3",
        kind: "Resource",
        name: "Projector",
        path_name: "Santuary"
    },
    {
        id: "res4",
        kind: "Resource",
        name: "Sound System",
        path_name: "Santuary"
    }],
    tags: [],
    startTime: nowDate.toString(),
    endTime: nowDate.toString(),
    collectionId: "",
    collectionName: ""
}} currentDay={nowDate} timeZone={Temporal.Now.timeZoneId()} />