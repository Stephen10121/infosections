import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import type { AuthProviderInfo, RecordAuthResponse } from "pocketbase";
import { config } from "dotenv";
import { fetchFileFromURL } from "$lib/utils.js";
import { newUserLoggedIn } from "@/newUserLoggedIn";
import Stripe from "stripe";

config();

export async function GET({ locals, url, cookies }) {
    const expectedState = cookies.get("state");
    const expectedVerifier = cookies.get("verifier");

    if (!expectedState || !expectedVerifier) {
        return redirect(303, "/");
    }

    let redirectURL;

    if (dev) {
        if (url.origin.includes(".dev")) {
            redirectURL = url.origin.replace("http", "https") + "/google_oath";
        } else {
            redirectURL = url.origin + "/google_oath";
        }
    } else {
        redirectURL = process.env.VITE_WEBSITE_URL + "/google_oath";
    }
        
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");

    if (!state || !code) {
        return redirect(303, "/");
    }

    let provider: AuthProviderInfo | undefined;
    try {
        const authMethods = await locals.pb.collection("users").listAuthMethods({
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    
        if (!authMethods.oauth2.enabled) {
            console.log("Oath not enabled.");
            return redirect(303, "/");
        }
    
        for (let i=0;i<authMethods.oauth2.providers.length;i++) {
            if (authMethods.oauth2.providers[i].name === "google") {
                provider = authMethods.oauth2.providers[i];
            }
        }
    } catch (err) {
        console.log("List auth methods error.", err);
        return redirect(303, "/");
    }

    if (!provider) {
        console.log("Provider not found.");
        return redirect(303, "/");
    }

    if (expectedState != state) {
        console.log("Returned state does not match expected state.");
        return redirect(303, "/");
    }
    
    let res: RecordAuthResponse;
    try {
        res = await locals.pb.collection("users").authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL, {
            new: true
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });

        cookies.set("pb_auth", locals.pb.authStore.exportToCookie().split(";")[0], {
            path: "/"
        })
    } catch (err) {
        console.log("Error signing up with oath", err);
        return redirect(303, "/");
    }

    const newUserRecord = locals.pb.authStore.record;
    if (newUserRecord && res.meta) {
        const in89Days = new Date(new Date().setDate((new Date()).getDate() + 89));
        const in2hours = new Date(new Date().setHours((new Date()).getHours() + 2));
        const fileResp = await fetchFileFromURL(res.meta.avatarUrl);
        if (newUserRecord.new) {
            let stripeTrialSubscriptionUrl = "";
            let stripeSubscriptionUrl = "";
            let stripeCustomerID = "";

            try {
                const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);
                const customer = await stripe.customers.create({
                    metadata: {
                        internal_id: newUserRecord.id
                    },
                });

                const session = await stripe.checkout.sessions.create({
                    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
                    mode: 'subscription',
                    success_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
                    cancel_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
                    customer: customer.id,
                });
        
                const freeTrialSession = await stripe.checkout.sessions.create({
                    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
                    mode: 'subscription',
                    success_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
                    cancel_url: process.env.VITE_WEBSITE_URL! + "/dashboard",
                    customer: customer.id,
                    subscription_data: {
                        trial_period_days: 14
                    }
                });
        
                stripeTrialSubscriptionUrl = freeTrialSession.url ? freeTrialSession.url : "";
                stripeSubscriptionUrl = session.url ? session.url : "";
                stripeCustomerID = customer.id;
            } catch (err) {
                console.log(err);
            }
            
            await locals.pb.collection("users").update(newUserRecord.id, {
                new: false,
                avatar: fileResp.error ? null : fileResp.blob,
                name: res.meta.name ? res.meta.name : "New User",
                authToken: res.meta.accessToken,
                refreshToken: res.meta.refreshToken,
                refreshTokenExpires: in89Days,
                accessTokenExpires: in2hours,
                accessLevel: "none",
                customerId: stripeCustomerID,
                subscriptionURL: stripeSubscriptionUrl,
                freeTrialURL: stripeTrialSubscriptionUrl,
            }, {
                headers: {
                    "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
                }
            });

            // Tells the backend that the user has subscribed.
            await newUserLoggedIn(newUserRecord.id, newUserRecord.refreshToken);
        } else {
            await locals.pb.collection("users").update(newUserRecord.id, {
                avatar: fileResp.error ? null : fileResp.blob,
                name: res.meta.name ? res.meta.name : "New User",
                authToken: res.meta.accessToken,
                refreshToken: res.meta.refreshToken,
                refreshTokenExpires: in89Days,
                accessTokenExpires: in2hours,
            }, {
                headers: {
                    "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
                }
            });
        }
    }

    return redirect(303, "/dashboard");
}