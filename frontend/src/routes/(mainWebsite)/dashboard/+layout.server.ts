import type { CalendarDBModel, EventDBModel, EventDBModelPrivate, EventListDBModel, ImageFeedDBModel } from '@/utils.js';
import { redirect } from '@sveltejs/kit';
import { config } from "dotenv";
import Stripe from 'stripe';

config();

export async function load({ parent, locals }) {
    const data = await parent();

    if (!data.user) {
        return redirect(307, "/");
    }

    let stripeSubscriptionUrl = "";
    let stripeTrialSubscriptionUrl = "";
    if (data.user.accessLevel === "none") {
        try {
            const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);
            
            const session = await stripe.checkout.sessions.create({
                line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
                mode: 'subscription',
                success_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
                cancel_url: process.env.VITE_WEBSITE_URL!,
                customer: data.user.customerId,
            });
    
            const freeTrialSession = await stripe.checkout.sessions.create({
                line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
                mode: 'subscription',
                success_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
                cancel_url: process.env.VITE_WEBSITE_URL!,
                customer: data.user.customerId,
                subscription_data: {
                    trial_period_days: 14
                }
            });
    
            stripeTrialSubscriptionUrl = freeTrialSession.url ? freeTrialSession.url : "";
            stripeSubscriptionUrl = session.url ? session.url : "";
        } catch (err) {
            console.log(err);
        }
    }

    let calendars: CalendarDBModel[] = [];
    try {
        calendars = await locals.pb.collection('calendars').getFullList({
            filter: `owner="${data.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch calendars.", err);
    }

    let imageFeeds: ImageFeedDBModel[] = [];
    try {
        imageFeeds = await locals.pb.collection('imageFeeds').getFullList({
            filter: `owner="${data.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch image feeds.", err);
    }

    let eventLists: EventListDBModel[] = [];
    try {
        eventLists = await locals.pb.collection('eventLists').getFullList({
            filter: `owner="${data.user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch event lists.", err);
    }

    let events: EventDBModelPrivate[] = [];
    try {
        events = await locals.pb.collection('events').getFullList({
            filter: `owner="${data.user.id}"`,
            sort: 'startTime',
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Failed to fetch events.", err);
    }

    return {
        ...data,
        events,
        pb_url: process.env.PB_URL!,
        calendars,
        imageFeeds,
        eventLists,
        stripeSubscriptionUrl,
        stripeTrialSubscriptionUrl
    }
} 