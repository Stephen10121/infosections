import type { RecordModel } from "pocketbase";
import type { CalendarFilters } from "./cal.utils";

export type EventTimesType = {
	name: string;
	startTime: string;
	endTime: string;
};

export interface EventResourcesDBModel extends RecordModel {
	resource_id: string;
	kind: "Room" | "Resource";
	name: string;
	path_name: string;
	description: string;
	quantity: number;
}

export interface EventResourcesDBModelPrivate extends EventResourcesDBModel {
	id: string;
	owner: string;
}

export interface EventTagsDBModel extends RecordModel {
	tag_id: string;
	color: string;
	name: string;
}

export interface EventTagsDBModelPrivate extends EventTagsDBModel {
	id: string;
	owner: string;
}

export interface EventDBModel extends RecordModel {
	recEventId: string;
	name: string;
	description: string;
	imageURL: string;
	registrationURL: string;
	location: string;
	times: EventTimesType[] | null;
	startTime: string;
	endTime: string;
	featured: boolean;
	visibleInChurchCenter: boolean;
	recurrence: string;
	service: "planningcenter";
	resources: string[] | null;
	tags: string[] | null;
}

export interface EventDBModelExpanded extends EventDBModel {
	expand: {
		tags: EventTagsDBModel[] | null;
		resources: EventResourcesDBModel[] | null;
	};
}

export interface EventDBModelPrivate extends EventDBModel {
	owner: string;
}

export interface EventDBModelPrivateExpanded extends EventDBModelPrivate {
	expand: {
		tags: EventTagsDBModelPrivate[] | null;
		resources: EventResourcesDBModelPrivate[] | null;
	};
}

export const eventFieldRequirementsPublic =
	"id,recEventId,name,description,imageURL,registrationURL,location,times,startTime,endTime,featured,visibleInChurchCenter,created,updated,resources,tags";
export const tagsExpandRequirementsPublic = "expand.tags.tag_id,expand.tags.name,expand.tags.color";
export const resourcesExpandRequirementsPublic =
	"expand.resources.resource_id,expand.resources.kind,expand.resources.name,expand.resources.path_name,expand.resources.description,expand.resources.quantity";

export function eventResourceAllowListToFilterString(allowedResources: string[]) {
	let filterString = "";
	for (let i = 0; i < allowedResources.length; i++) {
		if (i == 0) {
			filterString += ` && ( resources ~ "${allowedResources[i]}"`;
		} else {
			filterString += ` || resources ~ "${allowedResources[i]}"`;
		}
	}
	filterString += " )";
	return filterString;
}

export function eventResourceBlockListToFilterString(blockedResources: string[]) {
	let filterString = "";
	for (let i = 0; i < blockedResources.length; i++) {
		filterString += ` && resources !~ "${blockedResources[i]}"`;
	}
	return filterString;
}

export function eventTagAllowListToFilterString(allowedTags: string[]) {
	let filterString = "";
	for (let i = 0; i < allowedTags.length; i++) {
		if (i == 0) {
			filterString += ` && ( tags ~ "${allowedTags[i]}"`;
		} else {
			filterString += ` || tags ~ "${allowedTags[i]}"`;
		}
	}
	filterString += " )";
	return filterString;
}

export function eventTagBlockListToFilterString(blockedTags: string[]) {
	let filterString = "";
	for (let i = 0; i < blockedTags.length; i++) {
		filterString += ` && tags !~ "${blockedTags[i]}"`;
	}
	return filterString;
}

export function filterEventsBasedOnTagAndResourceFilters(
	events: EventDBModelExpanded[],
	filters: CalendarFilters
) {
	return events.filter((event) => {
		let allGood = true;

		if (filters.enableResourceFiltering) {
			if (filters.resourceFilterType === "allow") {
				let allowedResourceFound = false;
				for (let i = 0; i < filters.allowResources.length; i++) {
					const allowedResource = filters.allowResources[i];
					if (allowedResource && event.resources?.includes(allowedResource)) {
						allowedResourceFound = true;
						break;
					}
				}
				if (!allowedResourceFound) allGood = false;
			} else {
				for (let i = 0; i < filters.blockResources.length; i++) {
					const blockedResource = filters.blockResources[i];
					if (blockedResource && event.resources?.includes(blockedResource)) {
						allGood = false;
						break;
					}
				}
			}
		}

		if (filters.enableTagFiltering) {
			if (filters.tagFilterType === "allow") {
				let allowedTagFound = false;
				for (let i = 0; i < filters.allowTags.length; i++) {
					const allowedTag = filters.allowTags[i];
					if (allowedTag && event.tags?.includes(allowedTag)) {
						allowedTagFound = true;
						break;
					}
				}
				if (!allowedTagFound) allGood = false;
			} else {
				for (let i = 0; i < filters.blockTags.length; i++) {
					const blockedTag = filters.blockTags[i];
					if (blockedTag && event.tags?.includes(blockedTag)) {
						allGood = false;
						break;
					}
				}
			}
		}

		return allGood;
	});
}
