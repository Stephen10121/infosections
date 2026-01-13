import type { UserModel } from '@/utils';
import { redirect } from '@sveltejs/kit';
import { config } from "dotenv";

config();

export async function load({ locals, url }) {
    if (locals.user) {
        try {
            const user: UserModel = await locals.pb.collection("users").getOne(locals.user.id, {
                headers: {
                    "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
                }
            });
            
            return {
                user,
                avatar: locals.pb.files.getURL(user, user.avatar),
                hasAccess: user.hasAccess,
                pathname: url.pathname,
                stripeUrl: process.env.STRIPE_URL!,
                stripeFreeTrialUrl: process.env.STRIPE_FREE_TRIAL_URL!,
                stripeCustomerPortal: process.env.STRIPE_CUSTOMER_PORTAL_LINK!
            }
        } catch (err) {
            console.log(err);

            throw redirect(303, "/logout");
        }
    }
    return {
        pathname: url.pathname,
        stripeFreeTrialUrl: process.env.STRIPE_FREE_TRIAL_URL!,
        stripeUrl: process.env.STRIPE_URL!,
        stripeCustomerPortal: process.env.STRIPE_CUSTOMER_PORTAL_LINK!
    }
}