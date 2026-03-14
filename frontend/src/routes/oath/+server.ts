import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import type { AuthProviderInfo, RecordAuthResponse } from "pocketbase";
import { config } from "dotenv";
import { fetchFileFromURL } from "$lib/utils.js";
import Stripe from "stripe";

config();

export async function GET({ locals, url, cookies }) {
    const expectedState = cookies.get("integrationState");
    const expectedVerifier = cookies.get("integrationVerifier");
    const expectedName = cookies.get("integrationName")

    if (!expectedState || !expectedVerifier || !expectedName) {
        return redirect(303, "/");
    }

    if (!locals.user) return redirect(303, "/");

    let redirectURL;

    if (dev) {
        if (url.origin.includes(".dev")) {
            redirectURL = url.origin.replace("http", "https") + "/oath";
        } else {
            redirectURL = url.origin + "/oath";
        }
    } else {
        redirectURL = process.env.VITE_WEBSITE_URL + "/oath";
    }
        
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");

    if (!state || !code) {
        return redirect(303, "/");
    }

    let provider: AuthProviderInfo | undefined;
    try {
        const authMethods = await locals.pb.collection("integration").listAuthMethods({
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    
        if (!authMethods.oauth2.enabled) {
            console.log("Oath not enabled.");
            return redirect(303, "/");
        }
    
        for (let i=0;i<authMethods.oauth2.providers.length;i++) {
            if (authMethods.oauth2.providers[i].name === expectedName) {
                provider = authMethods.oauth2.providers[i]
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
        res = await locals.pb.collection("integration").authWithOAuth2Code(provider.name, code, expectedVerifier, redirectURL, {
            prettyName: provider.displayName,
            owner: locals.user.id,
            service: provider.name,
            status: "connected"
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log("Error signing up with oath", err);
        return redirect(303, "/");
    }

    if (res.record && res.meta) {
        const in89Days = new Date(new Date().setDate((new Date()).getDate() + 89));
        const in1hour = new Date(new Date().setHours((new Date()).getHours() + 1));
        const in2hours = new Date(new Date().setHours((new Date()).getHours() + 2));
            
        await locals.pb.collection("integration").update(res.record.id, {
            refreshToken: res.meta.refreshToken,
            accessToken: res.meta.accessToken,
            refreshTokenExpires: in89Days,
            accessTokenExpires: in2hours,
            lastEventsFetch: in1hour
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
        }

    return redirect(303, "/dashboard");
}