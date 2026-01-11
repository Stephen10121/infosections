import type { CalendarDBModel, EventListDBModel, ImageFeedDBModel } from '@/utils.js';
import { redirect } from '@sveltejs/kit';
import { config } from "dotenv";

config();

export async function load({ parent, locals }) {
    const data = await parent();

    if (!data.user) {
        return redirect(301, "/");
    }

    let calendars: CalendarDBModel[] = [];
    try {
        calendars = await locals.pb.collection('calendars').getFullList({
            filter: `owner="${data.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch calendars.", err);
    }

    let imageFeeds: ImageFeedDBModel[] = [];
    try {
        imageFeeds = await locals.pb.collection('imageFeeds').getFullList({
            filter: `owner="${data.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch image feeds.", err);
    }

    let eventLists: EventListDBModel[] = [];
    try {
        eventLists = await locals.pb.collection('eventLists').getFullList({
            filter: `owner="${data.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch event lists.", err);
    }

    return {
        ...data,
        pb_url: process.env.PB_URL!,
        calendars,
        imageFeeds,
        eventLists
    }
} 