import { redirect } from '@sveltejs/kit';
import { config } from "dotenv";

config();

export async function load({ parent }) {
    const data = await parent();

    if (!data.user) {
        return redirect(307, "/");
    }

    return {
        ...data,
        pb_url: process.env["PB_URL"]!,
        stripeSubscriptionUrl: data.user.subscriptionURL,
        stripeTrialSubscriptionUrl: data.user.freeTrialURL
    }
} 