import { dev } from "$app/environment";
import { form, getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import type { AuthProviderInfo } from "pocketbase";
import * as v from "valibot";
import { getMyIntegrations } from "./backend.remote";

config();

const AddIntegrationData = v.object({
	provider: v.string()
});

export const addAnIntegration = form(AddIntegrationData, async (integrationData) => {
	const { locals, url, cookies } = getRequestEvent();

	if (!locals.user) return redirect(303, "/");

	const authMethods = await locals.pb.collection("integration").listAuthMethods();

	if (!authMethods.oauth2.enabled) return redirect(303, "/dashboard");

	let redirectURL;

	if (dev) {
		if (url.origin.includes(".dev")) {
			redirectURL = url.origin.replace("http", "https") + "/oath";
		} else {
			redirectURL = url.origin + "/oath";
		}
	} else {
		redirectURL = process.env["VITE_WEBSITE_URL"] + "/oath";
	}

	let authProvider: AuthProviderInfo | undefined;
	for (let i = 0; i < authMethods.oauth2.providers.length; i++) {
		const currentAuthProvider = authMethods.oauth2.providers[i];
		if (currentAuthProvider && currentAuthProvider.name === integrationData.provider) {
			authProvider = authMethods.oauth2.providers[i];
		}
	}

	if (!authProvider) return redirect(303, "/dashboard");

	const authProviderRedirect = `${authProvider.authURL}${redirectURL}`;

	const state = authProvider.state;
	const verifier = authProvider.codeVerifier;
	const name = authProvider.name;

	cookies.set("integrationState", state, {
		path: "/"
	});

	cookies.set("integrationVerifier", verifier, {
		path: "/"
	});

	cookies.set("integrationName", name, {
		path: "/"
	});

	const url2 = new URL(authProviderRedirect);
	const params = url2.searchParams;

	// We need to widen the oath scope for planning center oath.
	if (name === "planningcenter") {
		params.set("scope", "calendar people services");
	} else if (name === "twitter") {
		params.set("scope", "offline.access users.read users.email tweet.read");
	}

	url2.search = params.toString();

	const newUrl = url2.toString();

	return redirect(303, newUrl);
});

const RemoveIntegrationData = v.object({
	id: v.string()
});

export const removeAnIntegration = form(RemoveIntegrationData, async (integrationData) => {
	const { locals } = getRequestEvent();

	if (!locals.user) return redirect(303, "/");

	try {
		const record = await locals.pb
			.collection("integration")
			.getFirstListItem(`id="${integrationData.id}" && owner ="${locals.user.id}"`, {
				headers: {
					Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
				}
			});

		await locals.pb.collection("integration").delete(record.id, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});

		getMyIntegrations().refresh();
	} catch (err) {
		console.log(err);
		return redirect(303, "/dashboard");
	}

	return { msg: "Good" };
});
