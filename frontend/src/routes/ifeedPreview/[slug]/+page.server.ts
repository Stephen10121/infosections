import type { CalendarCustomizations, CalendarFilters, CustomImageIFeedDBModel, EventDBModel, ImageFeedDBModel } from "@/utils";
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

    // These variables and the for loop checks if any of the cals need to access a private event. If so, we need to change the event fetch filtering.
    let visibleInChurchCenterEventRequired = false;
    let featuredEventRequired = false;

    if (additionalCalendars) {
        for (let i=0;i<additionalCalendars.length;i++) {
            if (additionalCalendars[i].filters.onlyShowFeatured === false) {
                featuredEventRequired = true;
            }
    
            if (additionalCalendars[i].filters.hideUnpublished === false) {
                visibleInChurchCenterEventRequired = true;
            }
        }
    }
    
    const today = new Date();
    const now = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${(today.getDate()-2).toString().padStart(2, '0')}`;

    let events: EventDBModel[] = [];
    try {
        let filter = `startTime > "${now}"`;

        // This filter shows all events for the testing dev feed.
        if (imageFeed.id !== "v7t0bmf8o0rqx5b") {
            filter += ` && owner = "${imageFeed.owner}"`;
        }

        if (imageFeed.filters.onlyShowFeatured && !featuredEventRequired) {
            filter += " && featured=true"
        }

        if (imageFeed.filters.hideUnpublished && !visibleInChurchCenterEventRequired) {
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

    return {
        events,
        customEvents,
        name: imageFeed.name,
        logoLink: locals.pb.files.getURL(imageFeed, imageFeed.logo),
        displaySettings: imageFeed.displaySettings,
        description: imageFeed.description,
        apiServer: process.env.PB_URL!,
        additionalCalendars,
        filters: imageFeed.filters
    }
}