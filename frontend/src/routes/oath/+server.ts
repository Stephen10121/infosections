import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import type { AuthProviderInfo, RecordAuthResponse } from "pocketbase";
import { config } from "dotenv";
import { updateSpecificUserEvents } from "../(mainWebsite)/dashboard/backend.remote";

config();

export async function GET({ locals, url, cookies }) {
    const expectedState = cookies.get("integrationState");
    const expectedVerifier = cookies.get("integrationVerifier");
    const expectedName = cookies.get("integrationName");

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

    try {
        const record = await locals.pb.collection('integration').getFirstListItem(`service="${provider.name}" && owner ="${locals.user.id}"`, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });

        if (record) {
            return redirect(303, "/dashboard");
        }
    } catch (_err) {
        //All Good. The record doesnt exist.
    }
    
    try {
        const token = await fetch("https://api.planningcenteronline.com/oauth/token", {
            method: "POST",
            headers: {
                "Authorization": "Basic " + Buffer.from(`${process.env.PLANNING_CENTER_CLIENT_ID!}:${process.env.PLANNING_CENTER_CLIENT_SECRET!}`).toString("base64")
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectURL,
                client_id: process.env.PLANNING_CENTER_CLIENT_ID!,
                code_verifier: expectedVerifier
            })
        }).then(r => r.json());

        const in89Days = new Date(new Date().setDate((new Date()).getDate() + 89));
        const in1hour = new Date(new Date().setHours((new Date()).getHours() + 1));
        const in2hours = new Date(new Date().setHours((new Date()).getHours() + 2));

        await locals.pb.collection("integration").create({
            owner: locals.user.id,
            service: provider.name,
            refreshToken: token.refresh_token,
            accessToken: token.access_token,
            refreshTokenExpires: in89Days,
            accessTokenExpires: in2hours,
            lastEventsFetch: in1hour,
            password: "12345678",
            passwordConfirm: "12345678",
            prettyName: provider.displayName,
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

    await updateSpecificUserEvents();

    return redirect(303, "/dashboard");
}