import { command, getRequestEvent } from "$app/server";
import * as v from "valibot";
import { config } from "dotenv";
import type { DynamicURLModel, UserModel } from "@/utils";

config();

const CreateDynamicURLSchema = v.object({
    id: v.string(),
    defaultRedirectTo: v.pipe(v.string(), v.url()),
    timeZone: v.string()
});

export const createDynamicURLCommand = command(CreateDynamicURLSchema, async (newURLData) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    let dynamicURL: DynamicURLModel | null = null;
    try {
        dynamicURL = await locals.pb.collection("dynamic_url").getOne(newURLData.id, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(_err) {
        //All Good
    }

    if (dynamicURL) {
        return {
            error: true,
            msg: `URL ID: "${newURLData.id}" already in use.`
        }
    }

    let user: UserModel | null = null;
    let dynamicURLs: DynamicURLModel[] = [];
    try {
        user = await locals.pb.collection("users").getOne(locals.user.id, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return {
            error: true,
            msg: "No User."
        }
    }

    if (!user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    try {
        dynamicURLs = await locals.pb.collection('dynamic_url').getFullList({
            filter: `owner = "${user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return {
            error: true,
            msg: "Internal Server Error."
        }
    }

    if (dynamicURLs.length > 0 && user.accessLevel === "none") {
        return {
            error: true,
            msg: "Exceed the amount of dynamic URLs on the free plan."
        }
    }

    try {
        let data: Partial<DynamicURLModel> = {
            "id": newURLData.id,
            "defaultRedirectTo": newURLData.defaultRedirectTo,
            "timeZone": newURLData.timeZone,
            "weekSheet": [[],[],[],[],[],[],[]],
            "refs": [],
            "owner": locals.user.id
        };

        await locals.pb.collection('dynamic_url').create(data, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return {
            error: true,
            msg: "Internal Server Error."
        }
    }

    return {
        error: false,
        msg: "Successfully created dynamic URL."
    }
});