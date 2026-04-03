import { type AuthProviderInfo, type RecordModel } from "pocketbase";
import { error, invalid, redirect } from "@sveltejs/kit";
import { EmailSchema } from "@/valibotSchemaHelpers";
import { form, getRequestEvent } from "$app/server";
import { dev } from "$app/environment";
import { config } from "dotenv";
import * as v from "valibot";
import Stripe from "stripe";

config();

const EmailPasswordLoginSchema = v.object({
    email: EmailSchema,
    password: v.pipe(v.string(), v.minLength(8, "The password must be longer than 8 characters."))
});

export const emailPasswordLogin = form(EmailPasswordLoginSchema, async (newSignupData, issue) => {
    const { locals, cookies } = getRequestEvent();

    try {
        await locals.pb.collection('users').authWithPassword(
            newSignupData.email,
            newSignupData.password,
        );

        cookies.set("pb_auth", locals.pb.authStore.exportToCookie().split(";")[0], {
            path: "/"
        })
    } catch (err) {
        console.log(err);

        return invalid(issue.email("Something went wrong."));
    }


    redirect(303, "/dashboard");
});