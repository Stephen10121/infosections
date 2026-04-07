import type { RecordModel } from "pocketbase";

export type EventTimesType = {
	name: string,
	startTime: string,
	endTime: string
}

export interface EventResourcesDBModel extends RecordModel {
	resource_id: string
	kind: "Room" | "Resource",
	name: string,
	path_name: string,
	description: string,
	quantity: number
}

export interface EventResourcesDBModelPrivate extends EventResourcesDBModel {
	id: string,
	owner: string
}

export interface EventTagsDBModel extends RecordModel {
	tag_id: string,
	color: string,
	name: string
}

export interface EventTagsDBModelPrivate extends EventTagsDBModel {
	id: string,
	owner: string
}

export interface EventDBModel extends RecordModel {
	recEventId: string,
	name: string,
	description: string,
	imageURL: string,
	registrationURL: string,
	location: string,
	times: EventTimesType[] | null,
	// resources: string[] | null
	// tags: string[] | null,
	startTime: string,
	endTime: string,
	featured: boolean,
	visibleInChurchCenter: boolean
	recurrence: string,
	service: "planningcenter"
}

export interface EventDBModelExpanded extends EventDBModel {
	expand: {
		tags: EventTagsDBModel[] | null,
		resources: EventResourcesDBModel[] | null
	}
}

export interface EventDBModelPrivate extends EventDBModel {
	owner: string
}

export interface EventDBModelPrivateExpanded extends EventDBModelPrivate {
	expand: {
		tags: EventTagsDBModelPrivate[] | null,
		resources: EventResourcesDBModelPrivate[] | null
	}
}

export const eventFieldRequirementsPublic = "id,recEventId,name,description,imageURL,registrationURL,location,times,startTime,endTime,featured,visibleInChurchCenter,created,updated";
export const tagsExpandRequirementsPublic = "expand.tags.tag_id,expand.tags.name,expand.tags.color";
export const resourcesExpandRequirementsPublic = "expand.resources.resource_id,expand.resources.kind,expand.resources.name,expand.resources.path_name,expand.resources.description,expand.resources.quantity";