import { command, form, getRequestEvent } from "$app/server";
import { EmailSchema } from "@/valibotSchemaHelpers";
import { error, fail, invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import { ClientResponseError, type RecordModel } from "pocketbase";
import * as v from "valibot";

config();

const CreateEmailPasswordSignupSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty("Your name is required.")),
    email: EmailSchema,
    password: v.pipe(v.string(), v.minLength(8, "The password must be longer than 8 characters.")),
    passwordConfirm: v.pipe(v.string(), v.minLength(8, "The password must be at least 8 characters long."))
});

export const createEmailPasswordSignup = form(CreateEmailPasswordSignupSchema, async (newSignupData, issue) => {
    const { locals } = getRequestEvent();

    if (newSignupData.password !== newSignupData.passwordConfirm) return invalid(issue.passwordConfirm("Passwords dont match."))

    let existingEmailUser: RecordModel | undefined;
    try {
        existingEmailUser = await locals.pb.collection('users').getFirstListItem(`email="${newSignupData.email}"`, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
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
            email: newSignupData.email
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });

        console.log(res);
    } catch (err) {
        if (err instanceof ClientResponseError) {
            console.log(err.response.data);
        } else {
            return error(500, "Internal Error");
        }
    }

    redirect(303, "/");
});