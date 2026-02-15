import { type DynamicURLModel, type UserModel, type WeekSheetTimeSlot } from "@/utils.js";
import { error, json } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function DELETE({ locals, request }) {
    if (!locals.user) return error(401, "No user");

    const formData = await request.formData();

    const id = formData.get("id");

    if (id === null) {
        return error(400, "Missing Data.");
    }

    let dynamicURL: DynamicURLModel | null = null;
    try {
        dynamicURL = await locals.pb.collection("dynamic_url").getOne(id.toString(), {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(err) {
        console.log(err);
        return error(500);
    }

    if (dynamicURL === null) {
        return error(400, "No user");
    }

    if (dynamicURL.owner !== locals.user.id) {
        return error(401, "Invalid Request.");
    }

    try {
        await locals.pb.collection('dynamic_url').delete(dynamicURL.id, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return error(500);
    }

    return json({msg: "ok"});
}

export async function PATCH({ locals, request }) {
    if (!locals.user) return error(401, "No user");

    const formData = await request.formData();

    const id = formData.get("id");
    const defaultRedirectTo = formData.get("defaultRedirectTo");
    const timeZone = formData.get("timeZone");
    const weekSheet = formData.get("weekSheet");
    const enableWeekSheet = formData.get("enableWeekSheet");
    const enableOverrideRedirect = formData.get("enableOverrideRedirect");
    const disableURL = formData.get("disableURL");
    const overrideRedirectTo = formData.get("overrideRedirectTo");


    if (id == null || defaultRedirectTo == null || timeZone == null || weekSheet == null || enableWeekSheet == null || enableOverrideRedirect == null || disableURL == null) {
        return error(400, "Missing Data.");
    }

    let parsedWeekSheet: WeekSheetTimeSlot[][];
    try {
        parsedWeekSheet = JSON.parse(weekSheet.toString());
    } catch (_) {
        return error(400, "Missing Data.");
    }

    let dynamicURL: DynamicURLModel | null = null;
    try {
        dynamicURL = await locals.pb.collection("dynamic_url").getOne(id.toString(), {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(err) {
        console.log(err);
        return error(500);
    }

    if (dynamicURL === null) {
        return error(400, "No user");
    }

    if (dynamicURL.owner !== locals.user.id) {
        return error(401, "Invalid Request.");
    }

    try {
        let data: Partial<DynamicURLModel> = {
            "defaultRedirectTo": defaultRedirectTo.toString(),
            "timeZone": timeZone.toString(),
            "weekSheet": parsedWeekSheet,
            "enableWeekSheet": enableWeekSheet.toString() === "1",
            "enableOverrideRedirect": enableOverrideRedirect.toString() === "1",
            "disableURL": disableURL.toString() === "1",
        };

        if (enableOverrideRedirect.toString() === "1" && overrideRedirectTo !== null) {
            data["overrideRedirectTo"] = overrideRedirectTo.toString();
        }

        await locals.pb.collection('dynamic_url').update(dynamicURL.id, data, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return error(500);
    }

    return json({msg: "ok"});
}

export async function POST({ locals, request }) {
    if (!locals.user) return error(401, "No user");

    const formData = await request.formData();

    const id = formData.get("id");
    const defaultRedirectTo = formData.get("defaultRedirectTo");
    const timeZone = formData.get("timeZone");

    if (id == null || defaultRedirectTo == null || timeZone == null) {
        return error(400, "Missing Data.");
    }

    let dynamicURL: DynamicURLModel | null = null;
    try {
        dynamicURL = await locals.pb.collection("dynamic_url").getOne(id.toString(), {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(_err) {
        //All Good
    }

    if (dynamicURL) {
        return error(409, "URL ID in use.");
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

        return error(401, "No user");
    }

    if (!user) {
        return error(401, "No user");
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

        return error(500, "No user");
    }

    if (dynamicURLs.length > 0 && user.accessLevel === "none") {
        return error(402, "Exceed the amount of dynamic URLs on the free plan.");
    }

    try {
        let data: Partial<DynamicURLModel> = {
            "id": id.toString(),
            "defaultRedirectTo": defaultRedirectTo.toString(),
            "timeZone": timeZone.toString(),
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

        return error(500);
    }

    return json({msg: "ok"});
}