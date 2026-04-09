import { command, getRequestEvent, query } from "$app/server";
import type { EventDBModelPrivateExpanded, EventResourcesDBModelPrivate, EventTagsDBModelPrivate } from "@/event.utils";
import { getMyIntegrations } from "./backend.remote";
import { config } from "dotenv";

config();

export const getAllUserEvents = query(async () => {
    const { locals } = getRequestEvent();
    let events: EventDBModelPrivateExpanded[] = [];
    
    if (!locals.user) return events;
    
    try {
        events = await locals.pb.collection('events').getFullList({
            filter: `owner="${locals.user.id}"`,
            expand: "tags,resources",
            sort: 'startTime',
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to events.", err);
    }
    
    return events;
});

export const updateSpecificUserEvents = command(async () => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }
    
    const response = await fetch(process.env["PB_URL"] + `updateSpecificUserEvents/${locals.user.id}`, {
        method: 'PATCH',
        headers: {
            "X-PCO-Webhooks-Authenticity": locals.user.customerId
        }
    });
    if (!response.ok) {
        console.log(response);
        return {
            error: false,
            msg: "Failed to refetch events."
        }
    }

    getMyIntegrations().refresh();
    getAllUserEvents().refresh();
    return {
        error: false,
        msg: "Successful sync"
    }
});

export const getMyEventTagsPrivate = query(async () => {
    const { locals } = getRequestEvent();
    let tags: EventTagsDBModelPrivate[] = [];

    if (!locals.user) return tags;

    try {
        tags = await locals.pb.collection('tags').getFullList({
            filter: `owner="${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch tags.", err);
    }

    return tags;
});

export const getMyEventResourcesPrivate = query(async () => {
    const { locals } = getRequestEvent();
    let resources: EventResourcesDBModelPrivate[] = [];

    if (!locals.user) return resources;

    try {
        resources = await locals.pb.collection('resources').getFullList({
            filter: `owner="${locals.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to fetch resources.", err);
    }

    return resources;
});