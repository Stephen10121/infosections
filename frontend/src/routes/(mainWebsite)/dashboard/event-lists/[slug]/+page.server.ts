import type { EventListDBModel } from '@/utils.js';
import { redirect } from '@sveltejs/kit';
import { config } from "dotenv";

config();

export async function load({ params, parent }) {
    const data = await parent();
    let slug = params.slug;

    let selectedlist: EventListDBModel | null = null;
    for (let i=0;i<data.eventLists.length;i++) {
        if (data.eventLists[i].id === slug) {
            selectedlist = data.eventLists[i];
        }
    }

    if (!selectedlist) {
        return redirect(301, "/dashboard/event-lists");
    }

    return {
        selectedlist,
        apiServer: process.env.PB_URL!
    }
}