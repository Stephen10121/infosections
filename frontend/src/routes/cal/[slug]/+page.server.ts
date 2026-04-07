import { eventFieldRequirementsPublic, resourcesExpandRequirementsPublic, tagsExpandRequirementsPublic, type EventDBModelExpanded } from "@/event.utils";
import { error, redirect } from "@sveltejs/kit";
import type { CalendarDBModel } from "@/cal.utils";
import { Temporal } from "temporal-polyfill";
import { config } from "dotenv";

config();

export async function load({ params, locals, cookies }) {
    let calendar: CalendarDBModel;
    try {
        calendar = await locals.pb.collection('calendars').getOne(params.slug, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Calendar not found.", err);
        return error(404, "Calendar Not Found");
    }

    if (calendar.password && calendar.passwordEnabled) {
        if (cookies.get(`cal-${params.slug}`) !== calendar.password) {
            return redirect(307, `/cal/${params.slug}/login`);
        }
    }

    let today = Temporal.Now.zonedDateTimeISO().startOfDay();
    let monthAgo = today.subtract({ days: today.day + 7 });
    let monthAgoStr = `${monthAgo.year}-${(monthAgo.month).toString().padStart(2, '0')}-${(monthAgo.day).toString().padStart(2, '0')}`;

    let events: EventDBModelExpanded[] = [];
    try {
        // let filter = `startTime >= "${seventyTwoHoursAgoStr}" && startTime <= "${seventyTwoHoursLaterStr}"`;
        let filter = `startTime >= "${monthAgoStr}"`;


        // This filter shows all events for the testing dev cal.
        if (calendar.id !== "sdinfaplylaesst") {
            filter += ` && owner="${calendar.owner}"`;
        }

        if (calendar.filters.onlyShowFeatured) {
            filter += " && featured=true"
        }

        if (calendar.filters.hideUnpublished) {
            filter += " && visibleInChurchCenter=true"
        }

        events = await locals.pb.collection('events').getFullList({
            filter,
            expand: "tags,resources",
            sort: 'startTime',
            fields: eventFieldRequirementsPublic + "," + tagsExpandRequirementsPublic + "," + resourcesExpandRequirementsPublic,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Calendar not found.");
        return error(500, "Internal Server error.");
    }

    try {
        await locals.pb.collection('calendars').update(calendar.id, { 
            visits: calendar.visits + 1
        }, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to update the visits", err);
        return error(500);
    }

    return {
        events,
        name: calendar.name,
        logoLink: locals.pb.files.getURL(calendar, calendar.logo.toString()),
        displaySettings: calendar.displaySettings,
        filters: calendar.filters
    }
}