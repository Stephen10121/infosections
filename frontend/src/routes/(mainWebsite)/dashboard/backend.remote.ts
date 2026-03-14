//This file can fetch all the needed data from the pocketbase instance. Stuff like calendars, image feeds, etc.
import { getRequestEvent, query } from "$app/server";
import type { IntegrationModel } from "@/utils";
import { config } from "dotenv";

config();

export const getMyIntegrations = query(async () => {
    const { locals } = getRequestEvent();
    let myIntegrations: IntegrationModel[] = [];

    if (!locals.user) return myIntegrations;

    myIntegrations = await locals.pb.collection("integration").getFullList({
        filter: `owner="${locals.user.id}"`,
        headers: {
            "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
        }
    });

    return myIntegrations;
});