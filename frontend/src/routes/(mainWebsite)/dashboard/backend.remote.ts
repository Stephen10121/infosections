//This file can fetch all the needed data from the pocketbase instance. Stuff like calendars, image feeds, etc.
import { getRequestEvent, query } from "$app/server";
import type { CalendarDBModel, IntegrationModel } from "@/utils";
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
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
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
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
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
export const getMyCalendarById = query(v.string(), async (id) => {
    const { locals } = getRequestEvent();
    let calendar: CalendarDBModel | undefined;

    if (!locals.user) return redirect(303, "/dashboard/calendars");

    try {
        calendar = await locals.pb.collection('calendars').getOne(id, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
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