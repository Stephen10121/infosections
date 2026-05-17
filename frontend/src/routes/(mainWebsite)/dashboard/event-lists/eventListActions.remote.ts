import { defaultEventListFilters, defaultImageListCustomizations, type EventListDBModel } from "@/utils";
import { getEventListById, getMyEventLists } from "../backend.remote";
import { command, form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

const CreateEventListSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty("A name for the list is required.")),
    description: v.pipe(v.string(), v.nonEmpty("A description for the list is required."))
});

export const createEventListCommand = command(CreateEventListSchema, async (newEList) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    const eventLists = await getMyEventLists();

    if (eventLists.length > 1 && locals.user.accessLevel === "none") {
        return {
            error: true,
            msg: "Exceed the amount of event lists on the free plan."
        }
    }

    try {
        let data: Partial<EventListDBModel> = {
            "name": newEList.name,
            "description": newEList.description,
            "owner": locals.user.id,
            "displaySettings": defaultImageListCustomizations,
            "filters": defaultEventListFilters
        };

        await locals.pb.collection('eventLists').create(data, {
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

    getMyEventLists().refresh();
    return {
        error: false,
        msg: "Successfully created event list."
    }
});

const UpdateEventListSchema = v.object({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    avatarLink: v.optional(v.string()),
    newAvatar: v.optional(v.any()),
    displaySettings: v.object({
        displayStyle: v.picklist(["minimal", "expanded"]),
        showEventName: v.optional(v.boolean(), false),
        showEventDescription: v.optional(v.boolean(), false),
        showEventRegistration: v.optional(v.boolean(), false),
        showUpcomingEventsTextAndDesc: v.optional(v.boolean(), false),
	    setTransparentBackground: v.optional(v.boolean(), false)
    }),
    filters: v.optional(v.object({
        onlyShowFeatured: v.optional(v.boolean(), false),
        hideUnpublished: v.optional(v.boolean(), false),
        hideRecurringEvents: v.optional(v.boolean(), false)
    }), undefined)
});

export const updateEventListForm = form(UpdateEventListSchema, async (updatedEList, issue) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return redirect(303, "/");
    }

    const currentEventList = await getEventListById(updatedEList.id);

    try {
        let data: Partial<EventListDBModel> = {
            "name": updatedEList.name,
            "description": updatedEList.description,
            "displaySettings": updatedEList.displaySettings,
            "filters": updatedEList.filters ? updatedEList.filters : {
                "hideUnpublished": false,
                "onlyShowFeatured": false,
                "hideRecurringEvents": false
            }
        };

        if (!updatedEList.avatarLink && updatedEList.newAvatar) {
            const newAvatar = updatedEList.newAvatar as File;
            const file = new File([await newAvatar.arrayBuffer()], newAvatar.name, { type: newAvatar.type });
            data["logo"] = file;
        }
        
        if (!updatedEList.avatarLink && !updatedEList.newAvatar) {
            data["logo"] = "";
        }

        await locals.pb.collection('eventLists').update(currentEventList.id, data, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log(err);

        return invalid(issue.id("Failed to update event list."));
    }

    getMyEventLists().refresh();
    getEventListById(currentEventList.id).refresh();
    return {
        error: false,
        msg: "Successfully updated event list."
    }
});

export const deleteEventListCommand = command(v.string(), async (id) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return {
            error: true,
            msg: "No User."
        }
    }

    const eventList = await getEventListById(id);

    try {
        await locals.pb.collection('eventLists').delete(eventList.id, {
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

    getMyEventLists().refresh();
    return {
        error: false,
        msg: "Successfully deleted event list."
    }
});