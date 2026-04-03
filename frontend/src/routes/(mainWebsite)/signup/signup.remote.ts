import { type AuthProviderInfo, type RecordModel } from "pocketbase";
import { error, invalid, redirect } from "@sveltejs/kit";
import { EmailSchema } from "@/valibotSchemaHelpers";
import { form, getRequestEvent } from "$app/server";
import { dev } from "$app/environment";
import { config } from "dotenv";
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
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
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
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });

        const stripe = new Stripe(process.env["STRIPE_PRIVATE_KEY"]!);
        const customer = await stripe.customers.create({
            email: newSignupData.email,
            metadata: {
                internal_id: res.id
            },
        });

        const session = await stripe.checkout.sessions.create({
            line_items: [{ price: process.env["STRIPE_PRICE_ID"]!, quantity: 1 }],
            mode: 'subscription',
            success_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
            cancel_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
            customer: customer.id,
        });

        const freeTrialSession = await stripe.checkout.sessions.create({
            line_items: [{ price: process.env["STRIPE_PRICE_ID"]!, quantity: 1 }],
            mode: 'subscription',
            success_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
            cancel_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
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
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });

        await locals.pb.collection('users').authWithPassword(
            newSignupData.email,
            newSignupData.password,
        );

        const authCookieString = locals.pb.authStore.exportToCookie().split(";");
        cookies.set("pb_auth", authCookieString[0] ? authCookieString[0] : "", {
            path: "/"
        })
    } catch (err) {
        console.log(err);
        return error(500, "Internal Error");
    }

    redirect(303, "/dashboard");
});

const GoogleLoginSchema = v.object({
    id: v.string()
});

export const googleLoginSignup = form(GoogleLoginSchema, async (_id, issue) => {
    const { locals, cookies, url } = getRequestEvent();
    
    locals.pb.authStore.clear();
    const authMethods = await locals.pb.collection('users').listAuthMethods();

    if (!authMethods.oauth2.enabled) {
        return {
            authProviders: '',
        }
    }

    let redirectURL;

    if (dev) {
        if (url.origin.includes(".dev")) {
            redirectURL = url.origin.replace("http", "https") + "/google_oath";
        } else {
            redirectURL = url.origin + "/google_oath";
        }
    } else {
        redirectURL = process.env["VITE_WEBSITE_URL"] + "/google_oath";
    }

    let authProvider: AuthProviderInfo | undefined;

    for (let i=0;i<authMethods.oauth2.providers.length;i++) {
        const currentAuthProvider = authMethods.oauth2.providers[i];
        if (currentAuthProvider && currentAuthProvider.name === "google") {
            authProvider = authMethods.oauth2.providers[i];
        }
    }

    if (!authProvider) return invalid(issue.id("Google Login is not working right now!"));
    
    const authProviderRedirect = `${authProvider.authURL}${redirectURL}`;

    const state = authProvider.state;
    const verifier = authProvider.codeVerifier;

    cookies.set('state', state, {
        path: "/"
    });

    cookies.set('verifier', verifier, {
        path: "/"
    });

    return redirect(303, authProviderRedirect);
});