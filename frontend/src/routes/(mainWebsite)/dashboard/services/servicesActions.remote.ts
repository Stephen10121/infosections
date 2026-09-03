import { getMyServices, getServiceById } from "../services.remote";
import { command, form, getRequestEvent } from "$app/server";
import type { AServiceDBModel } from "@/service.util";
import { invalid, redirect } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

async function servicePublicIdInUse(locals: App.Locals, pubID: string) {
	try {
		await locals.pb.collection("services").getFirstListItem(`public_id="${pubID}"`, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
		return true;
	} catch (err) {
		return false;
	}
}

const CreateServiceSchema = v.object({
	publicId: v.pipe(
		v.string(),
		v.regex(/^[a-zA-Z0-9]+$/, "No spaces or special characters allowed.")
	),
	newAvatar: v.optional(v.any()),
	name: v.string(),
	description: v.optional(v.string()),
	service_type: v.string(),
	custom_intro: v.optional(v.string()),
	display_settings: v.object({
		theme: v.picklist(["minimal", "bulletin", "full"]),
		show_series_information: v.optional(v.boolean(), false),
		show_service_times: v.optional(v.boolean(), false),
		show_song_list: v.optional(v.boolean(), false),
		show_notes: v.optional(v.boolean(), false)
	})
});

export const createServiceForm = form(CreateServiceSchema, async (newService, issue) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(303, "/");
	}

	const services = await getMyServices();

	if (services.length > 0 && locals.user.accessLevel === "none") {
		return invalid(issue.description("Exceeded the amount of services on the free plan."));
	}

	if (await servicePublicIdInUse(locals, newService.publicId)) {
		return invalid(issue.publicId("Service URL path already taken.."));
	}

	try {
		let data: Partial<AServiceDBModel> = {
			publicId: newService.publicId,
			name: newService.name,
			description: newService.description,
			owner: locals.user.id,
			service_type: newService.service_type,
			custom_intro: newService.custom_intro,
			display_settings: newService.display_settings
		};

		if (newService.newAvatar) {
			const newAvatar = newService.newAvatar as File;
			const file = new File([await newAvatar.arrayBuffer()], newAvatar.name, {
				type: newAvatar.type
			});
			data["logo"] = file as any as string;
		}

		await locals.pb.collection("services").create(data, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log(err);

		return invalid(issue.description("Failed to create service."));
	}

	getMyServices().refresh();
	return {
		error: false,
		msg: "Successfully created service."
	};
});

const UpdateServiceSchema = v.object({
	id: v.string(),
	avatarLink: v.optional(v.string()),
	publicId: v.pipe(
		v.string(),
		v.regex(/^[a-zA-Z0-9]+$/, "No spaces or special characters allowed.")
	),
	newAvatar: v.optional(v.any()),
	name: v.string(),
	description: v.optional(v.string()),
	service_type: v.string(),
	custom_intro: v.optional(v.string()),
	display_settings: v.object({
		theme: v.picklist(["minimal", "bulletin", "full"]),
		show_series_information: v.optional(v.boolean(), false),
		show_service_times: v.optional(v.boolean(), false),
		show_song_list: v.optional(v.boolean(), false),
		show_notes: v.optional(v.boolean(), false)
	})
});

export const updateServiceForm = form(UpdateServiceSchema, async (updatedService, issue) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(303, "/");
	}

	const service = await getServiceById(updatedService.id);

	if (
		service.public_id !== service.public_id &&
		(await servicePublicIdInUse(locals, updatedService.publicId))
	) {
		return invalid(issue.publicId("Service URL path already taken."));
	}

	try {
		let data: Partial<AServiceDBModel> = {
			publicId: updatedService.publicId,
			name: updatedService.name,
			description: updatedService.description,
			display_settings: updatedService.display_settings,
			service_type: updatedService.service_type,
			custom_intro: updatedService.custom_intro
		};

		if (!updatedService.avatarLink && updatedService.newAvatar) {
			const newAvatar = updatedService.newAvatar as File;
			const file = new File([await newAvatar.arrayBuffer()], newAvatar.name, {
				type: newAvatar.type
			});
			data["logo"] = file as any as string;
		}

		if (!updatedService.avatarLink && !updatedService.newAvatar) {
			data["logo"] = "";
		}

		await locals.pb.collection("services").update(service.id, data, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log(err);

		return invalid(issue.id("Failed to update service."));
	}

	getMyServices().refresh();
	getServiceById(service.id).refresh();
	return {
		error: false,
		msg: "Successfully updated services."
	};
});

export const deleteServiceCommand = command(v.string(), async (id) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return {
			error: true,
			msg: "No User."
		};
	}

	const service = await getServiceById(id);

	try {
		await locals.pb.collection("services").delete(service.id, {
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

	getMyServices().refresh();

	return {
		error: false,
		msg: "Successfully deleted service."
	};
});
