import { command, getRequestEvent, query } from "$app/server";
import type { EventDBModelPrivate } from "@/event.utils";
import { getMyIntegrations } from "./backend.remote";
import { config } from "dotenv";

config();

export const getAllUserEvents = query(async () => {
    const { locals } = getRequestEvent();
    let events: EventDBModelPrivate[] = [];
    
    if (!locals.user) return events;
    
    try {
        events = await locals.pb.collection('events').getFullList({
            filter: `owner="${locals.user.id}"`,
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