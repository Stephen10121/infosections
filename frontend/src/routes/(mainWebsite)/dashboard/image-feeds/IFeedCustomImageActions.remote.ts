import { command, form, getRequestEvent } from "$app/server";
import { getCustomImagesForIFeed } from "../backend.remote";
import { type CustomImageIFeedDBModel } from "@/utils";
import { invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

const CreateCustomImageSchema = v.object({
	picture: v.any(),
	showLink: v.pipe(
		v.optional(v.boolean(), false),
		v.transform((val) => val ?? false)
	),
	linkText: v.pipe(
		v.optional(v.string(), ""),
		v.transform((val) => val ?? "")
	),
	registrationURL: v.optional(v.union([v.pipe(v.string(), v.url()), v.literal("")]), ""),
	currentIFeed: v.string()
});

export const createCustomImageForm = form(
	CreateCustomImageSchema,
	async (newCustomImage, issue) => {
		const { locals } = getRequestEvent();

		if (!locals.user) {
			return redirect(303, "/");
		}

		if (locals.user.accessLevel === "none") {
			return invalid(issue.registrationURL("You need to be subsrcibed to use this feature."));
		}

		if (newCustomImage.showLink && !newCustomImage.registrationURL) {
			return invalid(issue.registrationURL("Link URL cannot be empty."));
		}

		if (newCustomImage.showLink && newCustomImage.linkText.length === 0) {
			return invalid(issue.linkText("Link Button Text cannot be empty."));
		}

		try {
			let data: Partial<CustomImageIFeedDBModel> = {
				linkText: newCustomImage.linkText,
				registrationURL: newCustomImage.registrationURL,
				showLink: newCustomImage.showLink,
				imageFeed: [newCustomImage.currentIFeed],
				owner: locals.user.id
			};

			if (newCustomImage.picture) {
				const newAvatar = newCustomImage.picture as File;
				const file = new File([await newAvatar.arrayBuffer()], newAvatar.name, {
					type: newAvatar.type
				});
				data["picture"] = file;
			} else {
				return invalid(issue.registrationURL("A Picture is required."));
			}

			await locals.pb.collection("customImageIfeed").create(data, {
				headers: {
					Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
				}
			});
		} catch (err) {
			console.log(err);

			return invalid(issue.registrationURL("Failed to create custom image."));
		}

		getCustomImagesForIFeed(newCustomImage.currentIFeed).refresh();
		return {
			error: false,
			msg: "Successfully created image feed."
		};
	}
);

export const getCustomImageById = command(
	v.string(),
	async (
		id
	): Promise<
		| {
				error: true;
				msg: string;
		  }
		| {
				error: false;
				customImageIfeed: CustomImageIFeedDBModel;
		  }
	> => {
		const { locals } = getRequestEvent();

		if (!locals.user) {
			return {
				error: true,
				msg: "No User."
			};
		}

		let customImageIfeed: CustomImageIFeedDBModel | null = null;
		try {
			customImageIfeed = await locals.pb.collection("customImageIfeed").getOne(id, {
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

		if (customImageIfeed === null) {
			return {
				error: true,
				msg: "Custom Image doesnt exist."
			};
		}

		if (customImageIfeed.owner !== locals.user.id) {
			return {
				error: true,
				msg: "Unauthorized."
			};
		}

		return {
			error: false,
			customImageIfeed
		};
	}
);

const UpdateCustomImageSchema = v.object({
	id: v.string(),
	eventPictureLink: v.optional(v.string()),
	included: v.array(v.string()),
	uploadNewEventPicture: v.optional(v.any()),
	showLink: v.optional(v.boolean(), false),
	linkText: v.optional(v.string(), ""),
	registrationURL: v.optional(
		v.pipe(v.string(), v.url("Invalid Link URL. Please enter a valid URL."))
	),
	currentIFeedId: v.string()
});

export const updateCustomImageForm = form(
	UpdateCustomImageSchema,
	async (updatedCustomImage, issue) => {
		const { locals } = getRequestEvent();

		if (!locals.user) {
			return redirect(303, "/");
		}

		if (locals.user.accessLevel === "none") {
			return invalid(issue.registrationURL("You need to be subscibed to use this feature."));
		}

		if (updatedCustomImage.showLink && !updatedCustomImage.registrationURL) {
			return invalid(issue.registrationURL("Link URL cannot be empty."));
		}

		if (updatedCustomImage.showLink && updatedCustomImage.linkText.length === 0) {
			return invalid(issue.linkText("Link Button Text cannot be empty."));
		}

		if (!updatedCustomImage.eventPictureLink && !updatedCustomImage.uploadNewEventPicture) {
			return invalid(issue.registrationURL("Image is missing."));
		}

		const response = await getCustomImageById(updatedCustomImage.id);

		if (response.error) return redirect(303, "/dashboard/image-feeds");

		const { customImageIfeed } = response;

		try {
			let data: Partial<CustomImageIFeedDBModel> = {
				linkText: updatedCustomImage.linkText,
				registrationURL: updatedCustomImage.registrationURL,
				showLink: updatedCustomImage.showLink,
				imageFeed: updatedCustomImage.included
			};

			if (updatedCustomImage.uploadNewEventPicture) {
				const newAvatar = updatedCustomImage.uploadNewEventPicture as File;
				const file = new File([await newAvatar.arrayBuffer()], newAvatar.name, {
					type: newAvatar.type
				});
				data["picture"] = file;
			}

			await locals.pb.collection("customImageIfeed").update(customImageIfeed.id, data, {
				headers: {
					Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
				}
			});
		} catch (err) {
			console.log(err);

			return invalid(issue.id("Failed to update custom image."));
		}

		getCustomImagesForIFeed(updatedCustomImage.currentIFeedId).refresh();
		return {
			error: false,
			msg: "Successfully updated custom image."
		};
	}
);

export const deleteCustomImageCommand = command(
	v.object({
		id: v.string(),
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

		const response = await getCustomImageById(data.id);

		if (response.error) return response;

		try {
			await locals.pb.collection("customImageIfeed").delete(data.id, {
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

		getCustomImagesForIFeed(data.currentFeedID).refresh();
		return {
			error: false,
			msg: "Successfully deleted custom image."
		};
	}
);
