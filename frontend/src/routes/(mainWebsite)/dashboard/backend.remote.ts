//This file can fetch all the needed data from the pocketbase instance. Stuff like calendars, image feeds, etc.
import type { CustomImageIFeedDBModel, DynamicURLModel, EventListDBModel, ImageFeedDBModel, IntegrationModel } from "@/utils";
import { getRequestEvent, query } from "$app/server";
import type { CalendarDBModel } from "@/cal.utils";
import { redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

export const getMyIntegrations = query(async () => {
    const { locals } = getRequestEvent();
    let myIntegrations: IntegrationModel[] = [];

    if (!locals.user) return myIntegrations;

    try {
        myIntegrations = await locals.pb.collection("integration").getFullList({
            filter: `owner="${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Error when fetching integrations, ", err);
    }

    return myIntegrations;
});

export const getMyCalendars = query(async () => {
    const { locals } = getRequestEvent();
    let calendars: CalendarDBModel[] = [];

    if (!locals.user) return calendars;

    try {
        calendars = await locals.pb.collection('calendars').getFullList({
            filter: `owner="${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch calendars.", err);
    }

    return calendars;
});

/**
 * This gets a calendar by the database id, it also checks if the locals.user is the owner of this calendar. If not, the user gets redirected.
 */
export const getCalendarById = query(v.string(), async (id) => {
    const { locals } = getRequestEvent();
    let calendar: CalendarDBModel | undefined;

    if (!locals.user) return redirect(303, "/dashboard/calendars");

    try {
        calendar = await locals.pb.collection('calendars').getOne(id, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch calendars.", err);
        return redirect(303, "/dashboard/calendars");
    }

    if (!calendar) return redirect(303, "/dashboard/calendars");

    if (calendar.owner !== locals.user.id) return redirect(303, "/dashboard/calendars");

    return calendar;
});

export const getMyImageFeeds = query(async () => {
    const { locals } = getRequestEvent();
    let imageFeeds: ImageFeedDBModel[] = [];

    if (!locals.user) return imageFeeds;

    try {
        imageFeeds = await locals.pb.collection('imageFeeds').getFullList({
            filter: `owner="${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch image feeds.", err);
    }

    return imageFeeds;
});

/**
 * This gets a image feed by the database id, it also checks if the locals.user is the owner of this feed. If not, the user gets redirected.
 */
export const getImageFeedById = query(v.string(), async (id) => {
    const { locals } = getRequestEvent();
    let imageFeed: ImageFeedDBModel | undefined;

    if (!locals.user) return redirect(303, "/dashboard/image-feeds");

    try {
        imageFeed = await locals.pb.collection('imageFeeds').getOne(id, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch image feeds.", err);
        return redirect(303, "/dashboard/image-feeds");
    }

    if (!imageFeed) return redirect(303, "/dashboard/image-feeds");

    if (imageFeed.owner !== locals.user.id) return redirect(303, "/dashboard/image-feeds");

    return imageFeed;
});

export const getCustomImagesForIFeed = query(v.string(), async (id) => {
    const { locals } = getRequestEvent();
    let customImages: CustomImageIFeedDBModel[] = [];

    if (!locals.user) return customImages;

    try {
        customImages = await locals.pb.collection('customImageIfeed').getFullList({
            filter: `imageFeed ~ "${id}" && owner = "${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch image feed custom images.", err);
        return redirect(303, "/dashboard/image-feeds");
    }

    return customImages;
});

export const getMyEventLists = query(async () => {
    const { locals } = getRequestEvent();
    let eventLists: EventListDBModel[] = [];

    if (!locals.user) return eventLists;

    try {
        eventLists = await locals.pb.collection('eventLists').getFullList({
            filter: `owner="${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to event lists.", err);
    }

    return eventLists;
});

/**
 * This gets a event list by the database id, it also checks if the locals.user is the owner of this list. If not, the user gets redirected.
*/
export const getEventListById = query(v.string(), async (id) => {
    const { locals } = getRequestEvent();
    let eventList: EventListDBModel | undefined;
    
    if (!locals.user) return redirect(303, "/dashboard/event-lists");
    
    try {
        eventList = await locals.pb.collection('eventLists').getOne(id, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch event list.", err);
        return redirect(303, "/dashboard/event-lists");
    }
    
    if (!eventList) return redirect(303, "/dashboard/event-lists");
    
    if (eventList.owner !== locals.user.id) return redirect(303, "/dashboard/event-lists");
    
    return eventList;
});

export const getMyDynamicURLS = query(async () => {
    const { locals } = getRequestEvent();
    let dynamic_urls: DynamicURLModel[] = [];

    if (!locals.user) return dynamic_urls;

    try {
        dynamic_urls = await locals.pb.collection('dynamic_url').getFullList({
            filter: `owner="${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to dynamic urls.", err);
    }

    return dynamic_urls;
});