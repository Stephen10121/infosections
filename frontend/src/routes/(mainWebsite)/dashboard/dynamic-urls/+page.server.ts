import type { DynamicURLModel } from "@/utils.js";
import { redirect } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function load({ parent, locals }) {
    await parent();
    if (!locals.user) {
        return redirect(307, "/");
    }

    const dynamic_urls = await locals.pb.collection('dynamic_url').getFullList({
        filter: `owner="${locals.user.id}"`,
        headers: {
            "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
        }
    }) as DynamicURLModel[];

    return {
        dynamic_urls,
        websiteURL: process.env.VITE_WEBSITE_URL!
    }
}