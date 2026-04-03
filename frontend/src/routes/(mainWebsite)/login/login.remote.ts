import { EmailSchema } from "@/valibotSchemaHelpers";
import { form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

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

        const authCookieString = locals.pb.authStore.exportToCookie().split(";");
        cookies.set("pb_auth", authCookieString[0] ? authCookieString[0] : "", {
            path: "/"
        })
    } catch (err) {
        console.log(err);

        return invalid(issue.email("Something went wrong."));
    }


    redirect(303, "/dashboard");
});