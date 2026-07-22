import { getImageFeedById, getMyCalendars } from "../backend.remote";
import { command, getRequestEvent } from "$app/server";
import { config } from "dotenv";
import * as v from "valibot";

config();

export const updateIncludedCalendarsToIFeed = command(
	v.object({
		calIds: v.array(v.string()),
		currentFeedID: v.string()
	}),
	async (data) => {
		const { locals } = getRequestEvent();

		if (!locals.user) {
			return {
				error: true,
				msg: "No User."
			};
		}

		const imageFeed = await getImageFeedById(data.currentFeedID);
		const myCalendars = await getMyCalendars();
		let newCals = imageFeed.additionalCalendars;

		for (let i = 0; i < data.calIds.length; i++) {
			const currentCalId = data.calIds[i];
			if (!currentCalId) continue;

			if (imageFeed.additionalCalendars.includes(currentCalId)) continue;

			if (myCalendars.filter((cal) => cal.id === currentCalId).length === 0) continue;

			newCals.push(currentCalId);
		}

		try {
			await locals.pb.collection("imageFeeds").update(
				imageFeed.id,
				{
					additionalCalendars: newCals
				},
				{
					headers: {
						Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
					}
				}
			);
		} catch (err) {
			console.log(err);

			return {
				error: true,
				msg: "Failed to update the included calendars."
			};
		}

		getImageFeedById(data.currentFeedID).refresh();
		return {
			error: false,
			msg: "Successfully updated included calendars."
		};
	}
);

export const removeIncludedCalendarsToIFeed = command(
	v.object({
		calId: v.string(),
		currentFeedID: v.string()
	}),
	async (data) => {
		const { locals } = getRequestEvent();

		if (!locals.user) {
			return {
				error: true,
				msg: "No User."
			};
		}

		const imageFeed = await getImageFeedById(data.currentFeedID);
		try {
			await locals.pb.collection("imageFeeds").update(
				imageFeed.id,
				{
					additionalCalendars: imageFeed.additionalCalendars.filter((cal) => cal !== data.calId)
				},
				{
					headers: {
						Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
					}
				}
			);
		} catch (err) {
			console.log(err);

			return {
				error: true,
				msg: "Failed to update the included calendars."
			};
		}

		getImageFeedById(data.currentFeedID).refresh();
		return {
			error: false,
			msg: "Successfully updated included calendars."
		};
	}
);
