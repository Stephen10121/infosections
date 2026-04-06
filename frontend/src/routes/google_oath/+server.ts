import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import type { AuthProviderInfo, RecordAuthResponse } from "pocketbase";
import { config } from "dotenv";
import { fetchFileFromURL } from "$lib/utils.js";
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
        redirectURL = process.env["VITE_WEBSITE_URL"] + "/google_oath";
    }
        
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");

    if (!state || !code) {
        return redirect(303, "/?error=signup_oath_no_state");
    }

    let provider: AuthProviderInfo | undefined;
    try {
        const authMethods = await locals.pb.collection("users").listAuthMethods({
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    
        if (!authMethods.oauth2.enabled) {
            console.log("Oath not enabled.");
            return redirect(303, "/");
        }
    
        for (let i=0;i<authMethods.oauth2.providers.length;i++) {
            const provider2 = authMethods.oauth2.providers[i];
            if (provider2 !== undefined && provider2.name === "google") {
                provider = provider2;
            }
        }
    } catch (err) {
        console.log("List auth methods error.", err);
        return redirect(303, "/?error=signup_auth_method_get");
    }

    if (!provider) {
        console.log("Provider not found.");
        return redirect(303, "/?error=signup_auth_method_get");
    }

    if (expectedState != state) {
        console.log("Returned state does not match expected state.");
        return redirect(303, "/?error=signup_auth_method_get");
    }
    
    let res: RecordAuthResponse;
    try {
        res = await locals.pb.collection("users").authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL, {
            new: true
        }, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });

        const authCookie = locals.pb.authStore.exportToCookie().split(";");
        cookies.set("pb_auth", authCookie[0] ? authCookie[0] : "", {
            path: "/"
        })
    } catch (err) {
        console.log("Error signing up with oath", err);
        return redirect(303, "/?error=signup_auth_signup_fail");
    }

    const newUserRecord = locals.pb.authStore.record;
    if (newUserRecord && res.meta) {
        const fileFetchResp = await fetchFileFromURL(res.meta["avatarUrl"]);
        let file: File | null = null;
        if (!fileFetchResp.error) {
            file = new File([fileFetchResp.blob], "logo.png", { type: fileFetchResp.blob.type });
        }
        
        if (newUserRecord["new"]) {
            let stripeTrialSubscriptionUrl = "";
            let stripeSubscriptionUrl = "";
            let stripeCustomerID = "";

            try {
                const stripe = new Stripe(process.env["STRIPE_PRIVATE_KEY"]!);
                const customer = await stripe.customers.create({
                    metadata: {
                        internal_id: newUserRecord.id
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
        
                stripeTrialSubscriptionUrl = freeTrialSession.url ? freeTrialSession.url : "";
                stripeSubscriptionUrl = session.url ? session.url : "";
                stripeCustomerID = customer.id;
            } catch (err) {
                console.log("Failed to do stripe stuff", err);
                return redirect(303, "/?error=signup_stripe_error");
            }
            
            try {
                await locals.pb.collection("users").update(newUserRecord.id, {
                    new: false,
                    avatar: file,
                    name: res.meta["name"] ? res.meta["name"] : "New User",
                    accessLevel: "none",
                    customerId: stripeCustomerID,
                    subscriptionURL: stripeSubscriptionUrl,
                    freeTrialURL: stripeTrialSubscriptionUrl,
                }, {
                    headers: {
                        "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
                    }
                });
            } catch (err) {
                console.log("Failed to update user data after signup:", err);
                return redirect(303, "/?error=signup_after_oath");
            }
        } else {
            try {
                await locals.pb.collection("users").update(newUserRecord.id, {
                    avatar: file,
                    name: res.meta["name"] ? res.meta["name"] : "New User",
                }, {
                    headers: {
                        "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
                    }
                });
            } catch (err) {
                console.log("Failed to update user data after signup:", err);
                return redirect(303, "/?error=signup_after_oath");
            }
        }
    }

    return redirect(303, "/dashboard");
}