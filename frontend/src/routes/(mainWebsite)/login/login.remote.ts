import { EmailSchema } from "@/valibotSchemaHelpers";
import { form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";
import Stripe from "stripe";
import type { UserModel } from "@/utils";

config();

const EmailPasswordLoginSchema = v.object({
	email: EmailSchema,
	password: v.pipe(v.string(), v.minLength(8, "The password must be longer than 8 characters."))
});

export const emailPasswordLogin = form(EmailPasswordLoginSchema, async (newSignupData, issue) => {
	const { locals, cookies } = getRequestEvent();

	try {
		const user = (
			await locals.pb
				.collection("users")
				.authWithPassword(newSignupData.email, newSignupData.password)
		).record as UserModel;

		const authCookieString = locals.pb.authStore.exportToCookie().split(";");
		cookies.set("pb_auth", authCookieString[0] ? authCookieString[0] : "", {
			path: "/"
		});

		const stripe = new Stripe(process.env["STRIPE_PRIVATE_KEY"]!);

		const session = await stripe.checkout.sessions.create({
			line_items: [{ price: process.env["STRIPE_PRICE_ID"]!, quantity: 1 }],
			mode: "subscription",
			success_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
			cancel_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
			customer: user.customerId
		});

		const freeTrialSession = await stripe.checkout.sessions.create({
			line_items: [{ price: process.env["STRIPE_PRICE_ID"]!, quantity: 1 }],
			mode: "subscription",
			success_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
			cancel_url: process.env["VITE_WEBSITE_URL"]! + "/dashboard",
			customer: user.customerId,
			subscription_data: {
				trial_period_days: 14
			}
		});

		await locals.pb.collection("users").update(
			user.id,
			{
				freeTrialURL: freeTrialSession.url,
				subscriptionURL: session.url
			},
			{
				headers: {
					Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
				}
			}
		);
	} catch (err) {
		console.log(err);

		return invalid(issue.email("Something went wrong."));
	}

	redirect(303, "/dashboard");
});
