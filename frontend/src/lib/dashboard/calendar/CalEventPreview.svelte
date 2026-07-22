<script lang="ts">
	import type { CalendarCustomizations } from "@/cal.utils";
	import { Temporal } from "temporal-polyfill";
	import Event from "@/Event.svelte";

	let {
		displaySettings,
		nowDate
	}: {
		displaySettings: CalendarCustomizations;
		nowDate: Temporal.ZonedDateTime;
	} = $props();
</script>

<Event
	calendarCustomizations={displaySettings}
	event={{
		recurrence: "",
		service: "planningcenter",
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
		resources: [],
		tags: [],
		expand: {
			resources: [
				{
					resource_id: "res1",
					kind: "Room",
					name: "Kitchen",
					path_name: "",
					description: "",
					quantity: 1,
					id: "res1",
					collectionId: "",
					collectionName: ""
				},
				{
					resource_id: "res2",
					kind: "Room",
					name: "Santuary",
					path_name: "",
					description: "",
					quantity: 1,
					id: "res2",
					collectionId: "",
					collectionName: ""
				},
				{
					resource_id: "res3",
					kind: "Resource",
					name: "Projector",
					path_name: "Santuary",
					description: "",
					quantity: 1,
					id: "res3",
					collectionId: "",
					collectionName: ""
				},
				{
					resource_id: "res4",
					kind: "Resource",
					name: "Sound System",
					path_name: "Santuary",
					description: "",
					quantity: 1,
					id: "res4",
					collectionId: "",
					collectionName: ""
				}
			],
			tags: []
		},
		startTime: nowDate.toString(),
		endTime: nowDate.toString(),
		collectionId: "",
		collectionName: ""
	}}
	currentDay={nowDate}
	timeZone={Temporal.Now.timeZoneId()}
	fontScale={1}
/>
