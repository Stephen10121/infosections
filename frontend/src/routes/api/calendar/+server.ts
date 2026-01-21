import type { CalendarCustomizations, CalendarDBModel, CalendarFilters } from "@/utils.js";
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

    let calendar: RecordModel | null = null;
    try {
        calendar = await locals.pb.collection("calendars").getOne(id.toString(), {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(err) {
        console.log(err);
        return error(500);
    }

    if (calendar === null) {
        return error(400, "No user");
    }

    if (calendar.owner !== locals.user.id) {
        return error(401, "Invalid Request.");
    }

    try {
        await locals.pb.collection('calendars').delete(calendar.id, {
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
    const enablePassword = formData.get("enablePassword");
    const newPassword = formData.get("newPassword");
    const avatarLink = formData.get("avatarLink");
    const newAvatar = formData.get("newAvatar");
    const passwordScreenMessage = formData.get("passwordScreenMessage");
    const displaySettings = formData.get("displaySettings");
    const filters = formData.get("filters");


    if (id == null || name == null || description == null || enablePassword == null || newPassword == null || avatarLink == null || passwordScreenMessage == null || displaySettings === null || filters === null) {
        return error(400, "Missing Data.");
    }

    let parsedDisplaySettings: CalendarCustomizations;
    try {
        parsedDisplaySettings = JSON.parse(displaySettings.toString());
    } catch (_) {
        return error(400, "Missing Data.");
    }

    let parsedFilters: CalendarFilters;
    try {
        parsedFilters = JSON.parse(filters.toString());
    } catch (_) {
        return error(400, "Missing Data.");
    }

    let calendar: RecordModel | null = null;
    try {
        calendar = await locals.pb.collection("calendars").getOne(id.toString(), {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch(err) {
        console.log(err);
        return error(500);
    }

    if (calendar === null) {
        return error(400, "No user");
    }

    if (calendar.owner !== locals.user.id) {
        return error(401, "Invalid Request.");
    }

    try {
        let data: Partial<CalendarDBModel> = {
            "name": name.toString(),
            "description": description.toString(),
            "passwordEnabled": enablePassword.toString() === "1",
            "displaySettings": parsedDisplaySettings,
            "filters": parsedFilters
        };

        if (newPassword.toString().length > 0 && enablePassword.toString() === "1") {
            data["password"] = newPassword.toString();
        }

        if (enablePassword.toString() === "1") {
            data["passwordScreenMessage"] = passwordScreenMessage.toString();
        }

        if (avatarLink.toString().length === 0) {
            //@ts-ignore
            data["logo"] = newAvatar;
        }

        await locals.pb.collection('calendars').update(calendar.id, data, {
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
    const enablePassword = formData.get("enablePassword");
    const newPassword = formData.get("newPassword");

    if (name == null || description == null || enablePassword == null || newPassword == null) {
        return error(400, "Missing Data.");
    }

    let user: RecordModel | null = null;
    let calendars: RecordModel[] = [];
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
        calendars = await locals.pb.collection('calendars').getFullList({
            filter: `owner = "${user.id}"`,
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return error(500, "No user");
    }

    if (calendars.length > 0 && user.accessLevel === "none") {
        return error(402, "Exceed the amount of calendars on the free plan.");
    }

    try {
        let data: Partial<CalendarDBModel> = {
            "name": name.toString(),
            "description": description.toString(),
            "passwordEnabled": enablePassword.toString() === "1",
            "owner": locals.user.id,
            "displaySettings": {
                "useAMPM": true,
                "showResourcePathname": false,
                "onlyShowLocationTitle": false,
                "showLocation": true,
                "showResources": true,
	            "showRooms": true,
                "showDescription": false
            },
            "filters": {
                "hideUnpublished": true,
                "onlyShowFeatured": true
            }
        };

        if (enablePassword.toString() === "1") {
            data["password"] = newPassword.toString();
        }

        await locals.pb.collection('calendars').create(data, {
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