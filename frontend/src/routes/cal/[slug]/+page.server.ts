import type { CalendarDBModel, EventDBModel, EventDBModelPrivate } from "@/utils";
import { error, redirect } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function load({ params, locals, cookies }) {
    let calendar: CalendarDBModel;
    try {
        calendar = await locals.pb.collection('calendars').getOne(params.slug, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Calendar not found.", err);
        return error(404, "Calendar Not Found");
    }

    if (calendar.password && calendar.passwordEnabled) {
        if (cookies.get(`cal-${params.slug}`) !== calendar.password) {
            return redirect(301, `/cal/${params.slug}/login`);
        }
    }

    const seventyTwoHoursAgo = new Date(Date.now() - (72 * 60 * 60 * 1000));
    const seventyTwoHoursAgoStr = `${seventyTwoHoursAgo.getFullYear()}-${(seventyTwoHoursAgo.getMonth()+1).toString().padStart(2, '0')}-${(seventyTwoHoursAgo.getDate()-1).toString().padStart(2, '0')}`;

    const seventyTwoHoursLater = new Date(Date.now() + (72 * 60 * 60 * 1000));
    const seventyTwoHoursLaterStr = `${seventyTwoHoursLater.getFullYear()}-${(seventyTwoHoursLater.getMonth()+1).toString().padStart(2, '0')}-${(seventyTwoHoursLater.getDate()+1).toString().padStart(2, '0')}`;

    let events: EventDBModel[] = [];
    try {
        let filter = `startTime >= "${seventyTwoHoursAgoStr}" && startTime <= "${seventyTwoHoursLaterStr}"`;

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
            sort: 'startTime',
            fields: "id,name,description,imageURL,registrationURL,location,times,resources,tags,startTime,endTime,featured,visibleInChurchCenter,created,updated",
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
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
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to update the visits", err);
        return error(500);
    }

    return {
        events,
        name: calendar.name,
        logoLink: locals.pb.files.getURL(calendar, calendar.logo),
        displaySettings: calendar.displaySettings,
        filters: calendar.filters
    }
}