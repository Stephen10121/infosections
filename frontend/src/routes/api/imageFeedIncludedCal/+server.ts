import { defaultImageFeedCustomizations, type CalendarDBModel, type ImageFeedDBModel, type ImageFeedFilters } from "@/utils.js";
import { error, json } from "@sveltejs/kit";
import { config } from "dotenv";
import type { RecordModel } from "pocketbase";

config();

export async function DELETE({ locals, request }) {
    if (!locals.user) return error(401, "No user");

    const formData = await request.formData();

    const id = formData.get("id");
    const calendarId = formData.get("calId");

    if (id === null || calendarId === null) {
        return error(400, "Missing Data.");
    }

    const calID = calendarId.toString();

    let imageFeed: ImageFeedDBModel | null = null;
    try {
        imageFeed = await locals.pb.collection("imageFeeds").getOne(id.toString(), {
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

    if (!imageFeed.additionalCalendars.includes(calID)) {
        return error(404, "Invalid Request.");
    }

    try {
        await locals.pb.collection('imageFeeds').update(imageFeed.id, {
            "additionalCalendars": imageFeed.additionalCalendars.filter((cal) => cal !== calID),
        }, {
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
    const calendarIds = formData.get("calId");

    if (id === null || calendarIds === null) {
        return error(400, "Missing Data.");
    }

    let parsedCalIds: string[];
    try {
        parsedCalIds = JSON.parse(calendarIds.toString());
    } catch (_) {
        return error(400, "Missing Data.");
    }

    let imageFeed: ImageFeedDBModel | null = null;
    try {
        imageFeed = await locals.pb.collection("imageFeeds").getOne(id.toString(), {
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

    let errors: string[] = [];
    let newCals = imageFeed.additionalCalendars;

    for (let i=0;i<parsedCalIds.length;i++) {
        if (imageFeed.additionalCalendars.includes(parsedCalIds[i])) {
            errors.push(`Cal ${parsedCalIds[i]} Already exists.`);
            continue
        }

        let calendar: CalendarDBModel | null = null;
        try {
            calendar = await locals.pb.collection("calendars").getOne(parsedCalIds[i], {
                headers: {
                    "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
                }
            });
        } catch(err) {
            errors.push(`Error fetching ${parsedCalIds[i]}`);
            continue
        }
    
        if (calendar === null) {
            errors.push(`Error fetching ${parsedCalIds[i]}`);
            continue
        }
    
        if (calendar.owner !== locals.user.id) {
            errors.push(`${parsedCalIds[i]} calendar does not belong to ${locals.user.id}`);
            continue
        }

        newCals.push(parsedCalIds[i]);
    }

    try {
        await locals.pb.collection('imageFeeds').update(imageFeed.id, {
            "additionalCalendars": newCals,
        }, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (err) {
        console.log(err);

        return error(500);
    }

    return json({msg: "ok", errors});
}