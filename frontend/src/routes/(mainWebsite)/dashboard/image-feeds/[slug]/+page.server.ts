import type { CustomImageIFeedDBModel, ImageFeedDBModel } from '@/utils.js';
import { redirect } from '@sveltejs/kit';
import { config } from "dotenv";

config();

export async function load({ params, parent, locals }) {
    const data = await parent();
    let slug = params.slug;

    let selectedfeed: ImageFeedDBModel | null = null;
    for (let i=0;i<data.imageFeeds.length;i++) {
        if (data.imageFeeds[i].id === slug) {
            selectedfeed = data.imageFeeds[i];
        }
    }

    if (!selectedfeed) {
        return redirect(307, "/dashboard/image-feeds");
    }

    let customImages: CustomImageIFeedDBModel[] = [];
    try {
        customImages = await locals.pb.collection('customImageIfeed').getFullList({
            filter: `imageFeed ~ "${selectedfeed.id}" && owner = "${locals.user?.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch custom image feeds.", err);
    }

    return {
        selectedfeed,
        customImages,
        apiServer: process.env.PB_URL!
    }
}