import {
	defaultImageFeedCustomizations,
	defaultImageFeedFilters,
	type ImageFeedDBModel
} from "@/utils";
import { getImageFeedById, getMyImageFeeds } from "../backend.remote";
import { command, form, getRequestEvent } from "$app/server";
import { invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

const CreateImageFeedSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty("A name for the feed is required.")),
	description: v.pipe(v.string(), v.nonEmpty("A description for the feed is required."))
});

export const createImageFeedCommand = command(CreateImageFeedSchema, async (newIFeed) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return {
			error: true,
			msg: "No User."
		};
	}

	const imageFeeds = await getMyImageFeeds();

	if (imageFeeds.length > 0 && locals.user.accessLevel === "none") {
		return {
			error: true,
			msg: "Exceed the amount of image feeds on the free plan."
		};
	}

	try {
		let data: Partial<ImageFeedDBModel> = {
			name: newIFeed.name,
			description: newIFeed.description,
			owner: locals.user.id,
			displaySettings: defaultImageFeedCustomizations,
			filters: defaultImageFeedFilters
		};

		await locals.pb.collection("imageFeeds").create(data, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log(err);

		return {
			error: true,
			msg: "Internal Server Error."
		};
	}

	getMyImageFeeds().refresh();
	return {
		error: false,
		msg: "Successfully created image feed."
	};
});

const UpdateImageFeedSchema = v.object({
	id: v.string(),
	name: v.string(),
	description: v.string(),
	avatarLink: v.optional(v.string()),
	newAvatar: v.optional(v.any()),
	displaySettings: v.object({
		showEventExtraInfo: v.optional(v.boolean(), false),
		showEventName: v.optional(v.boolean(), false),
		showEventDescription: v.optional(v.boolean(), false),
		showEventRegistration: v.optional(v.boolean(), false),
		feedDurationMS: v.number()
	}),
	filters: v.optional(
		v.object({
			onlyShowFeatured: v.optional(v.boolean(), false),
			hideUnpublished: v.optional(v.boolean(), false),
			hideRecurringEvents: v.optional(v.boolean(), false)
		}),
		undefined
	)
});

export const updateImageFeedForm = form(UpdateImageFeedSchema, async (updatedIFeed, issue) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(303, "/");
	}

	const currentImageFeed = await getImageFeedById(updatedIFeed.id);

	try {
		let data: Partial<ImageFeedDBModel> = {
			name: updatedIFeed.name,
			description: updatedIFeed.description,
			displaySettings: updatedIFeed.displaySettings,
			filters: updatedIFeed.filters
				? updatedIFeed.filters
				: {
						hideUnpublished: false,
						onlyShowFeatured: false,
						hideRecurringEvents: false
					}
		};

		if (!updatedIFeed.avatarLink && updatedIFeed.newAvatar) {
			const newAvatar = updatedIFeed.newAvatar as File;
			const file = new File([await newAvatar.arrayBuffer()], newAvatar.name, {
				type: newAvatar.type
			});
			data["logo"] = file as any as string;
		}

		if (!updatedIFeed.avatarLink && !updatedIFeed.newAvatar) {
			data["logo"] = "";
		}

		await locals.pb.collection("imageFeeds").update(currentImageFeed.id, data, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log(err);

		return invalid(issue.id("Failed to update image feed."));
	}

	getMyImageFeeds().refresh();
	getImageFeedById(currentImageFeed.id).refresh();
	return {
		error: false,
		msg: "Successfully updated image feed."
	};
});

export const deleteImageFeedCommand = command(v.string(), async (id) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return {
			error: true,
			msg: "No User."
		};
	}

	const imageFeed = await getImageFeedById(id);

	try {
		await locals.pb.collection("imageFeeds").delete(imageFeed.id, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log(err);

		return {
			error: true,
			msg: `Internal Server Error.`
		};
	}

	getMyImageFeeds().refresh();
	return {
		error: false,
		msg: "Successfully deleted image feed."
	};
});
