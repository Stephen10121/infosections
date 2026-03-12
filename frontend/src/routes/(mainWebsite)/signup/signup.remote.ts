import { command, form, getRequestEvent } from "$app/server";
import { EmailSchema } from "@/valibotSchemaHelpers";
import { error, fail, invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import { ClientResponseError, type RecordModel } from "pocketbase";
import * as v from "valibot";
import Stripe from "stripe";

config();

const CreateEmailPasswordSignupSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty("Your name is required.")),
    email: EmailSchema,
    password: v.pipe(v.string(), v.minLength(8, "The password must be longer than 8 characters.")),
    passwordConfirm: v.pipe(v.string(), v.minLength(8, "The password must be at least 8 characters long."))
});

export const createEmailPasswordSignup = form(CreateEmailPasswordSignupSchema, async (newSignupData, issue) => {
    const { locals, cookies } = getRequestEvent();

    if (newSignupData.password !== newSignupData.passwordConfirm) return invalid(issue.passwordConfirm("Passwords dont match."))

    let existingEmailUser: RecordModel | undefined;
    try {
        existingEmailUser = await locals.pb.collection('users').getFirstListItem(`email="${newSignupData.email}"`, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        // All Good
        existingEmailUser = undefined;
    }

    if (existingEmailUser) return invalid(issue.email("Email already in use."));

    try {
        const res = await locals.pb.collection("users").create({
            name: newSignupData.name,
            password: newSignupData.password,
            passwordConfirm: newSignupData.passwordConfirm,
            email: newSignupData.email,
            accessLevel: "none"
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });

        const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);
        const customer = await stripe.customers.create({
            email: newSignupData.email,
            metadata: {
                internal_id: res.id
            },
        });

        const session = await stripe.checkout.sessions.create({
            customer_email: newSignupData.email,
            line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
            mode: 'subscription',
            success_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
            cancel_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
            customer: customer.id,
        });

        const freeTrialSession = await stripe.checkout.sessions.create({
            customer_email: newSignupData.email,
            line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
            mode: 'subscription',
            success_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
            cancel_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
            customer: customer.id,
            subscription_data: {
                trial_period_days: 14
            }
        });

        await locals.pb.collection("users").update(res.id, {
            customerId: customer.id,
            freeTrialURL: freeTrialSession.url,
            subscriptionURL: session.url
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });

        await locals.pb.collection('users').authWithPassword(
            newSignupData.email,
            newSignupData.password,
        );

        cookies.set("pb_auth", locals.pb.authStore.exportToCookie().split(";")[0], {
            path: "/"
        })
    } catch (err) {
        console.log(err);
        return error(500, "Internal Error");
    }

    redirect(303, "/dashboard");
});