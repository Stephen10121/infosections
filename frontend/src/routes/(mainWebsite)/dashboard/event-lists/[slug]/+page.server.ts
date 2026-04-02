import { config } from "dotenv";

config();

export async function load({ params, parent }) {
    await parent();
    let slug = params.slug;

    return {
        selectedlistId: slug,
        apiServer: process.env["PB_URL"]!
    }
}