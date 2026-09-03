import type { AServiceDBModel, PlanDBModel, ServiceTypeDBModel } from "@/service.util";
import { getRequestEvent, query } from "$app/server";
import { config } from "dotenv";
import * as v from "valibot";
import { redirect } from "@sveltejs/kit";

config();

export const getMyServiceTypes = query(async () => {
	const { locals } = getRequestEvent();
	let serviceTypes: ServiceTypeDBModel[] = [];

	if (!locals.user) return serviceTypes;

	try {
		serviceTypes = await locals.pb.collection("service_type").getFullList({
			filter: `owner="${locals.user.id}"`,
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log("Failed to fetch service types.", err);
	}

	return serviceTypes;
});

export const getPlansByServiceType = query(v.string(), async (serviceID) => {
	const { locals } = getRequestEvent();
	let plans: PlanDBModel[] = [];

	if (!locals.user) return plans;

	try {
		plans = await locals.pb.collection("plan").getFullList({
			filter: `owner="${locals.user.id}" && service_type="${serviceID}"`,
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log("Failed to plans.", err);
		return plans;
	}

	return plans;
});

export const getMyServices = query(async () => {
	const { locals } = getRequestEvent();
	let services: AServiceDBModel[] = [];

	if (!locals.user) return services;

	try {
		services = await locals.pb.collection("services").getFullList({
			filter: `owner="${locals.user.id}"`,
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log("Failed to fetch services.", err);
	}

	return services;
});

export const getServiceById = query(v.string(), async (id) => {
	const { locals } = getRequestEvent();
	let service: AServiceDBModel | undefined;

	if (!locals.user) return redirect(303, "/dashboard/services");

	try {
		service = await locals.pb.collection("services").getOne(id, {
			headers: {
				Authorization: "Bearer " + process.env["POCKETBASE_TOKEN"]!
			}
		});
	} catch (err) {
		console.log("Failed to fetch service.", err);
		return redirect(303, "/dashboard/services");
	}

	if (!service) return redirect(303, "/dashboard/services");

	if (service.owner !== locals.user.id) return redirect(303, "/dashboard/services");

	return service;
});
