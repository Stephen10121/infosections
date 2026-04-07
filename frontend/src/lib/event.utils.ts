import type { RecordModel } from "pocketbase";

export type EventTimesType = {
	name: string,
	startTime: string,
	endTime: string
}

export type EventResourcesType = {
	id: string,
	kind: string,
	name: string,
	path_name: string
}

export type EventTagsType = {
	id: string,
	color: string,
	name: string
}

export interface EventDBModel extends RecordModel {
	recEventId: string,
	name: string,
	description: string,
	imageURL: string,
	registrationURL: string,
	location: string,
	times: EventTimesType[] | null,
	resources: EventResourcesType[] | null
	tags: EventTagsType[] | null,
	startTime: string,
	endTime: string,
	featured: boolean,
	visibleInChurchCenter: boolean
	recurrence: string,
	service: "planningcenter"
}

export interface EventDBModelPrivate extends EventDBModel {
	owner: string
}