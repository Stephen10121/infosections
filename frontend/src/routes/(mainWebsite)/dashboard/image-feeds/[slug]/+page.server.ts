import { config } from "dotenv";

config();

export async function load({ params, parent }) {
    await parent();
    let slug = params.slug;

    return {
        selectedFeedId: slug
    }
}