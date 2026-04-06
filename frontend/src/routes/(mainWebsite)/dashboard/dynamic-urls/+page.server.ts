import { redirect } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function load({ parent, locals }) {
    await parent();
    if (!locals.user) {
        return redirect(307, "/");
    }

    return {
        websiteURL: process.env["VITE_WEBSITE_URL"]!
    }
}