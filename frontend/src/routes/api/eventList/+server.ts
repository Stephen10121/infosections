import { defaultImageListCustomizations, type EventListDBModel, type ImageFeedFilters, type ImageListCustomizations } from "@/utils.js";
import { error, json } from "@sveltejs/kit";
import { config } from "dotenv";
import type { RecordModel } from "pocketbase";

config();

export async function DELETE({ locals, request }) {
    if (!locals.user) return error(401, "No user");

    const formData = await request.formData();

    const id = formData.get("id");

    if (id === null) {
        return error(400, "Missing Data.");
    }

    let eventList: RecordModel | null = null;
    try {
        eventList = await locals.pb.collection("eventLists").getOne(id.toString(), {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(err) {
        console.log(err);
        return error(500);
    }

    if (eventList === null) {
        return error(400, "No user");
    }

    if (eventList.owner !== locals.user.id) {
        return error(401, "Invalid Request.");
    }

    try {
        await locals.pb.collection('eventLists').delete(eventList.id, {
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
    const name = formData.get("name");
    const description = formData.get("description");
    const avatarLink = formData.get("avatarLink");
    const newAvatar = formData.get("newAvatar");
    const displaySettings = formData.get("displaySettings");
    const filterSettings = formData.get("filterSettings");

    if (id == null || name == null || description == null || avatarLink == null || displaySettings === null || filterSettings === null) {
        return error(400, "Missing Data.");
    }

    let parsedDisplaySettings: ImageListCustomizations;
    try {
        parsedDisplaySettings = JSON.parse(displaySettings.toString());
    } catch (_) {
        return error(400, "Missing Data.");
    }

    let parsedFilterSettings: ImageFeedFilters;
    try {
        parsedFilterSettings = JSON.parse(filterSettings.toString());
    } catch (_) {
        return error(400, "Missing Data.");
    }

    let imageFeed: EventListDBModel | null = null;
    try {
        imageFeed = await locals.pb.collection("eventLists").getOne(id.toString(), {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(err) {
        console.log(err);
        return error(500);
    }

    if (imageFeed === null) {
        return error(400, "No user");
    }

    if (imageFeed.owner !== locals.user.id) {
        return error(401, "Invalid Request.");
    }

    try {
        let data: Partial<EventListDBModel> = {
            "name": name.toString(),
            "description": description.toString(),
            "displaySettings": parsedDisplaySettings,
            "filters": parsedFilterSettings
        };

        if (avatarLink.toString().length === 0) {
            //@ts-ignore
            data["logo"] = newAvatar;
        }

        await locals.pb.collection('eventLists').update(imageFeed.id, data, {
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

    const name = formData.get("name");
    const description = formData.get("description");

    if (name == null || description == null) {
        return error(400, "Missing Data.");
    }

    let user: RecordModel | null = null;
    let eventLists: EventListDBModel[] = [];
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
        eventLists = await locals.pb.collection('eventLists').getFullList({
            filter: `owner = "${user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return error(500, "No user");
    }

    if (eventLists.length > 0 && user.accessLevel === "none") {
        return error(402, "Exceed the amount of image feeds on the free plan.");
    }

    try {
        let data: Partial<EventListDBModel> = {
            "name": name.toString(),
            "description": description.toString(),
            "owner": locals.user.id,
            "displaySettings": defaultImageListCustomizations,
            "filters": {
                "hideUnpublished": true,
                "onlyShowFeatured": true
            }
        };

        await locals.pb.collection('eventLists').create(data, {
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