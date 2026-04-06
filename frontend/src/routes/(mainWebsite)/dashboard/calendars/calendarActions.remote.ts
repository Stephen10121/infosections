import { defaultCalendarCustomizations, type CalendarDBModel } from "@/utils";
import { getCalendarById, getMyCalendars } from "../backend.remote";
import { command, form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

const CreateCalendarSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty("A name for the calendar is required.")),
    description: v.pipe(v.string(), v.nonEmpty("A description for the calendar is required.")),
    enablePassword: v.boolean(),
    newPassword: v.string()
});

export const createCalendarCommand = command(CreateCalendarSchema, async (newCalendar) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    const calendars = await getMyCalendars();

    if (calendars.length > 0 && locals.user.accessLevel === "none") {
        return {
            error: true,
            msg: "Exceed the amount of calendars on the free plan."
        }
    }

    try {
        let data: Partial<CalendarDBModel> = {
            "name": newCalendar.name,
            "description": newCalendar.description,
            "passwordEnabled": newCalendar.enablePassword,
            "owner": locals.user.id,
            "displaySettings": defaultCalendarCustomizations,
            "filters": {
                "hideUnpublished": true,
                "onlyShowFeatured": true
            }
        };

        if (newCalendar.enablePassword) {
            data["password"] = newCalendar.newPassword;
        }

        await locals.pb.collection('calendars').create(data, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log(err);

        return {
            error: true,
            msg: "Internal Server Error."
        }
    }

    getMyCalendars().refresh();
    return {
        error: false,
        msg: "Successfully created calendar."
    }
});

const UpdateCalendarSchema = v.object({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    enablePassword: v.optional(v.boolean(), false),
    newPassword: v.optional(v.string()),
    avatarLink: v.optional(v.string()),
    newAvatar: v.optional(v.any()),
    passwordScreenMessage: v.optional(v.string()),
    displaySettings: v.object({
        viewType: v.picklist(["3day", "week", "month"]),
        useAMPM: v.optional(v.boolean(), false),
        showResourcePathname: v.optional(v.boolean(), false),
        onlyShowLocationTitle: v.optional(v.boolean(), false),
        showLocation: v.optional(v.boolean(), false),
        showResources: v.optional(v.boolean(), false),
        showRooms: v.optional(v.boolean(), false),
        showDescription: v.optional(v.boolean(), false)
    }),
    filters: v.optional(v.object({
        onlyShowFeatured: v.optional(v.boolean(), false),
	    hideUnpublished: v.optional(v.boolean(), false)
    }), undefined)
});

export const updateCalendarForm = form(UpdateCalendarSchema, async (updatedCalendar, issue) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return redirect(303, "/");
    }

    const calendar = await getCalendarById(updatedCalendar.id);

    try {
        let data: Partial<CalendarDBModel> = {
            "name": updatedCalendar.name,
            "description": updatedCalendar.description,
            "passwordEnabled": updatedCalendar.enablePassword,
            "displaySettings": updatedCalendar.displaySettings,
            "filters": updatedCalendar.filters ? updatedCalendar.filters : {
                "hideUnpublished": false,
                "onlyShowFeatured": false
            }
        };

        if (updatedCalendar.newPassword && updatedCalendar.newPassword.length > 0 && updatedCalendar.enablePassword) {
            data["password"] = updatedCalendar.newPassword;
        }

        if (updatedCalendar.passwordScreenMessage && updatedCalendar.passwordScreenMessage.length > 0 && updatedCalendar.enablePassword) {
            data["passwordScreenMessage"] = updatedCalendar.passwordScreenMessage;
        }

        if (!updatedCalendar.avatarLink && updatedCalendar.newAvatar) {
            const newAvatar = updatedCalendar.newAvatar as File;
            const file = new File([await newAvatar.arrayBuffer()], newAvatar.name, { type: newAvatar.type });
            data["logo"] = file;
        }
        
        if (!updatedCalendar.avatarLink && !updatedCalendar.newAvatar) {
            data["logo"] = "";
        }

        await locals.pb.collection('calendars').update(calendar.id, data, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log(err);

        return invalid(issue.id("Failed to update calendar."));
    }

    getMyCalendars().refresh();
    getCalendarById(calendar.id).refresh();
    return {
        error: false,
        msg: "Successfully updated calendar."
    }
});

export const deleteCalendarCommand = command(v.string(), async (id) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    const calendar = await getCalendarById(id);

    try {
        await locals.pb.collection('calendars').delete(calendar.id, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log(err);

        return {
            error: true,
            msg: `Internal Server Error.`
        }
    }

    getMyCalendars().refresh();
    // getMyCalendarById(calendar.id).refresh();
    return {
        error: false,
        msg: "Successfully deleted calendar."
    }
});