import type { EventDBModel, EventListDBModel } from "@/utils";
import { error } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function load({ params, locals }) {
    let eventList: EventListDBModel;
    try {
        eventList = await locals.pb.collection('eventLists').getOne(params.slug, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Event list not found.", err);
        return error(404, "Event list Not Found");
    }

    const today = new Date();
    const now = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${(today.getDate()-2).toString().padStart(2, '0')}`;

    let events: EventDBModel[] = [];
    try {
        let filter = `startTime > "${now}" && imageURL != ""`;

        // This filter shows all events for the testing dev feed.
        if (eventList.id !== "js44ym8zp9lfu3v") {
            filter += ` && owner = "${eventList.owner}"`;
        }

        if (eventList.filters.onlyShowFeatured) {
            filter += " && featured = true"
        }

        if (eventList.filters.hideUnpublished) {
            filter += " && visibleInChurchCenter = true"
        }

        events = await locals.pb.collection('events').getFullList({
            filter,
            sort: 'startTime',
            fields: "id,name,description,imageURL,registrationURL,location,startTime,endTime,featured,visibleInChurchCenter,created,updated",
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Events not found.", err);
        return error(500, "Internal Server error.");
    }

    try {
        await locals.pb.collection('eventLists').update(eventList.id, { 
            visits: eventList.visits + 1
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to update the visits for event list", err);
        return error(500);
    }

    return {
        events,
        name: eventList.name,
        logoLink: locals.pb.files.getURL(eventList, eventList.logo),
        displaySettings: eventList.displaySettings,
        description: eventList.description,
        apiServer: process.env.PB_URL!
    }
}