import { getRequestEvent, query } from "$app/server";
import type { EventListDBModel } from "@/utils";
import { error } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

export const getElistById = query(v.string(), async (listId) => {
	const { locals } = getRequestEvent();

	let eventList: EventListDBModel;
	try {
		eventList = await locals.pb.collection("eventLists").getOne(listId, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log("Event list not found.", err);
		return error(404, "Event list Not Found");
	}

	return eventList;
});
