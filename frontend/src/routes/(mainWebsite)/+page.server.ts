import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { config } from "dotenv";

config();

export async function load({ parent }) {
    await parent();
}

export const actions = {
    default: async ({ cookies, url, locals }) => {
        locals.pb.authStore.clear();
        const authMethods = await locals.pb.collection('users').listAuthMethods();

        // console.log(authMethods.oauth2.providers);
        // return redirect(307, "/");

        if (!authMethods.oauth2.enabled) {
            return {
                authProviders: '',
            }
        }

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
        
        const planningCenterAuthProvider = authMethods.oauth2.providers[0];
        const authProviderRedirect = `${planningCenterAuthProvider.authURL}${redirectURL}`;

        const state = planningCenterAuthProvider.state;
        const verifier = planningCenterAuthProvider.codeVerifier;

        cookies.set('state', state, {
            path: "/"
        });

        cookies.set('verifier', verifier, {
            path: "/"
        });

        const url2 = new URL(authProviderRedirect);
        const params = url2.searchParams;
        params.set("scope", "calendar people");
        url2.search = params.toString();

        const newUrl = url2.toString();

        return redirect(307, newUrl);
    }
};