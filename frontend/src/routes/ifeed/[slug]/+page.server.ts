import type { CalendarCustomizations, CalendarDBModel, CalendarFilters, CustomImageIFeedDBModel, EventDBModel, ImageFeedDBModel } from "@/utils";
import { error } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function load({ params, locals }) {
    let imageFeed: ImageFeedDBModel;
    try {
        imageFeed = await locals.pb.collection('imageFeeds').getOne(params.slug, {
            expand: "additionalCalendars",
            fields: "*,expand.additionalCalendars.displaySettings,expand.additionalCalendars.filters,expand.additionalCalendars.id",
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Image Feed not found.", err);
        return error(404, "Image Feed Not Found");
    }

    const additionalCalendars: {displaySettings: CalendarCustomizations, filters: CalendarFilters, id: string}[] = imageFeed.expand ? imageFeed.expand.additionalCalendars : [];

    const today = new Date();
    const now = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${(today.getDate()-2).toString().padStart(2, '0')}`;

    let events: EventDBModel[] = [];
    try {
        let filter = `startTime >= "${now}" && imageURL != ""`;

        // This filter shows all events for the testing dev feed.
        if (imageFeed.id !== "v7t0bmf8o0rqx5b") {
            filter += ` && owner="${imageFeed.owner}"`;
        }

        if (imageFeed.filters.onlyShowFeatured) {
            filter += " && featured=true"
        }

        if (imageFeed.filters.hideUnpublished) {
            filter += " && visibleInChurchCenter=true"
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

    let customEvents: CustomImageIFeedDBModel[] = [];
    try {
        let filter = `picture != "" && imageFeed ~ "${imageFeed.id}"`;

        // This filter shows all events for the testing dev feed.
        if (imageFeed.id !== "v7t0bmf8o0rqx5b") {
            filter += ` && owner = "${imageFeed.owner}"`;
        }

        customEvents = await locals.pb.collection('customImageIfeed').getFullList({
            filter,
            fields: "id,picture,registrationURL,created,updated,collectionId,showLink,linkText",
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Custom events not found.", err);
        customEvents = [];
    }

    try {
        await locals.pb.collection('imageFeeds').update(imageFeed.id, { 
            visits: imageFeed.visits + 1
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to update the visits for image feeds", err);
        return error(500);
    }

    return {
        events,
        customEvents,
        name: imageFeed.name,
        logoLink: locals.pb.files.getURL(imageFeed, imageFeed.logo),
        displaySettings: imageFeed.displaySettings,
        description: imageFeed.description,
        apiServer: process.env.PB_URL!,
        additionalCalendars
    }
}