import {
	eventResourceAllowListToFilterString,
	eventResourceBlockListToFilterString,
	resourcesExpandRequirementsPublic,
	eventTagAllowListToFilterString,
	eventTagBlockListToFilterString,
	tagsExpandRequirementsPublic,
	eventFieldRequirementsPublic,
	type EventDBModelExpanded
} from "@/event.utils";
import { getRequestEvent, query } from "$app/server";
import type { CalendarDBModel } from "@/cal.utils";
import { Temporal } from "temporal-polyfill";
import { config } from "dotenv";
import * as v from "valibot";

config();

export const getEventsForCalendar = query(v.string(), async (calId) => {
	const { locals, cookies } = getRequestEvent();
	let events: EventDBModelExpanded[] = [];
	let calendar: CalendarDBModel;

	try {
		calendar = await locals.pb.collection("calendars").getOne(calId, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log("Calendar not found.", err);
		return events;
	}

	if (calendar.password && calendar.passwordEnabled) {
		if (cookies.get(`cal-${calId}`) !== calendar.password) {
			return events;
		}
	}

	let today = Temporal.Now.zonedDateTimeISO().startOfDay();
	let monthAgo = today.subtract({ days: today.day + 7 });
	let monthAgoStr = `${monthAgo.year}-${monthAgo.month.toString().padStart(2, "0")}-${monthAgo.day.toString().padStart(2, "0")}`;

	try {
		// let filter = `startTime >= "${seventyTwoHoursAgoStr}" && startTime <= "${seventyTwoHoursLaterStr}"`;
		let filter = `startTime >= "${monthAgoStr}"`;

		// This filter shows all events for the testing dev cal.
		if (calendar.id !== "sdinfaplylaesst") {
			filter += ` && owner="${calendar.owner}"`;
		}

		if (calendar.filters.onlyShowFeatured) {
			filter += " && featured=true";
		}

		if (calendar.filters.hideUnpublished) {
			filter += " && visibleInChurchCenter=true";
		}

		if (calendar.filters.enableResourceFiltering) {
			if (calendar.filters.resourceFilterType === "allow") {
				filter += eventResourceAllowListToFilterString(calendar.filters.allowResources);
			} else {
				filter += eventResourceBlockListToFilterString(calendar.filters.blockResources);
			}
		}

		if (calendar.filters.enableTagFiltering) {
			if (calendar.filters.tagFilterType === "allow") {
				filter += eventTagAllowListToFilterString(calendar.filters.allowTags);
			} else {
				filter += eventTagBlockListToFilterString(calendar.filters.blockTags);
			}
		}

		events = await locals.pb.collection("events").getFullList({
			filter,
			expand: "tags,resources",
			sort: "startTime",
			fields:
				eventFieldRequirementsPublic +
				"," +
				tagsExpandRequirementsPublic +
				"," +
				resourcesExpandRequirementsPublic,
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log("Calendar not found.");
		return events;
	}

	return events;
});
