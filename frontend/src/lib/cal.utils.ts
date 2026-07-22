import type { RecordModel } from "pocketbase";

export type CalendarCustomizations = {
	viewType: "3day" | "week" | "month";
	useAMPM: boolean;
	showResourcePathname: boolean;
	onlyShowLocationTitle: boolean;
	showLocation: boolean;
	showResources: boolean;
	showRooms: boolean;
	showDescription: boolean;
};

export const defaultCalendarCustomizations: CalendarCustomizations = {
	viewType: "3day",
	useAMPM: true,
	showResourcePathname: false,
	onlyShowLocationTitle: false,
	showLocation: true,
	showResources: true,
	showRooms: true,
	showDescription: false
};

export type CalendarFilters = {
	onlyShowFeatured: boolean;
	hideUnpublished: boolean;
	resourceFilterType: "allow" | "block";
	allowResources: string[];
	blockResources: string[];
	enableResourceFiltering: boolean;
	tagFilterType: "allow" | "block";
	allowTags: string[];
	blockTags: string[];
	enableTagFiltering: boolean;
};

export const defaultCalendarFilters: CalendarFilters = {
	hideUnpublished: true,
	onlyShowFeatured: true,
	resourceFilterType: "block",
	allowResources: [],
	blockResources: [],
	enableResourceFiltering: false,
	tagFilterType: "block",
	allowTags: [],
	blockTags: [],
	enableTagFiltering: false
};

export interface CalendarDBModel extends RecordModel {
	publicId: string;
	name: string;
	password: string;
	passwordEnabled: boolean;
	owner: string;
	logo: string | File;
	visits: number;
	filters: CalendarFilters;
	description: string;
	passwordScreenMessage: string;
	displaySettings: CalendarCustomizations;
	created: string;
	updated: string;
}
