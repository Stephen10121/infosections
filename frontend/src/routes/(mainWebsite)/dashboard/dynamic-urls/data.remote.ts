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

const UpdateDynamicURLSchema = v.object({
    id: v.string(),
    defaultRedirectTo: v.pipe(v.string(), v.url()),
    timeZone: v.string(),
    weekSheet: v.array(v.array(v.object({
        startMinute: v.number(),
        endMinute: v.number(),
        link: v.pipe(v.string(), v.url())
    }))),
    enableWeekSheet: v.boolean(),
    enableOverrideRedirect: v.boolean(),
    disableURL: v.boolean(),
    overrideRedirectTo: v.nullish(v.union([v.pipe(v.string(), v.url()), v.pipe(v.string(), v.maxLength(0))])),
});

export const updateDynamicURLCommand = command(UpdateDynamicURLSchema, async (updatedURLData) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    if (updatedURLData.enableOverrideRedirect && !updatedURLData.overrideRedirectTo) {
        return {
            error: true,
            msg: "No Override URL provided."
        }
    }

    let dynamicURL: DynamicURLModel | null = null;
    try {
        dynamicURL = await locals.pb.collection("dynamic_url").getOne(updatedURLData.id, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(_err) {
        return {
            error: true,
            msg: `Dynamic URL not found.`
        }
    }

    if (dynamicURL === null) {
        return {
            error: true,
            msg: `Dynamic URL not found.`
        }
    }

    if (dynamicURL.owner !== locals.user.id) {
        return {
            error: true,
            msg: `Unauthorized.`
        }
    }

try {
        let data: Partial<DynamicURLModel> = {
            "defaultRedirectTo": updatedURLData.defaultRedirectTo,
            "timeZone": updatedURLData.timeZone,
            "weekSheet": updatedURLData.weekSheet,
            "enableWeekSheet": updatedURLData.enableWeekSheet,
            "enableOverrideRedirect": updatedURLData.enableOverrideRedirect,
            "disableURL": updatedURLData.disableURL,
        };

        if (updatedURLData.enableOverrideRedirect && updatedURLData.overrideRedirectTo && updatedURLData.overrideRedirectTo.length > 0) {
            data["overrideRedirectTo"] = updatedURLData.overrideRedirectTo;
        }

        await locals.pb.collection('dynamic_url').update(dynamicURL.id, data, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return {
            error: true,
            msg: `Internal Server Error.`
        }
    }

    return {
        error: false,
        msg: "Successfully updated dynamic URL."
    }
});

const DeleteDynamicURLSchema = v.object({
    id: v.string(),
});

export const deleteDynamicURLCommand = command(DeleteDynamicURLSchema, async (updatedURLData) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    let dynamicURL: DynamicURLModel | null = null;
    try {
        dynamicURL = await locals.pb.collection("dynamic_url").getOne(updatedURLData.id, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(_err) {
        return {
            error: true,
            msg: `Dynamic URL not found.`
        }
    }

    if (dynamicURL === null) {
        return {
            error: true,
            msg: `Dynamic URL not found.`
        }
    }

    if (dynamicURL.owner !== locals.user.id) {
        return {
            error: true,
            msg: `Unauthorized.`
        }
    }
    
    try {
        await locals.pb.collection('dynamic_url').delete(dynamicURL.id, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return {
            error: true,
            msg: `Internal Server Error.`
        }
    }

    return {
        error: false,
        msg: "Successfully deleted dynamic URL."
    }
});