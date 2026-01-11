import { clsx, type ClassValue } from "clsx";
import type { RecordModel } from "pocketbase";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * This function get the url that is passed and makes a fetch request to recieve the file. The function then returns the file in a blob format.
 * @param fileLink 
 * @returns Blob
 */
export async function fetchFileFromURL(fileLink: string): Promise<{error: false, blob: Blob} | {error: true, msg: unknown}> {
	try {
		const res = await fetch(fileLink);
		const blob = await res.blob();
		return {
			error: false,
			blob
		}
	} catch (err) {
		return {
			error: true,
			msg: err
		}
	}
}

// Don't judge
export function clearFileInput(ctrl: HTMLElement | null) {
	if (ctrl === null) return
	try {
		//@ts-ignore
		ctrl.value = null;
		//@ts-ignore
		if (ctrl.value) {
			//@ts-ignore
			ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl); 
		} 
		} catch(ex) {
	}
}

export const LONGDAYTOSTRING = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const MONTHTOSTRING = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dateRangeOverlaps(a_start: number, a_end: number, b_start: number, b_end: number) {
    if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
    if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
    if (b_start <  a_start && a_end   <  b_end) return true; // a in b
    return false;
}

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
}

export interface CustomImageIFeedDBModel extends RecordModel {
	picture: string,
	registrationURL: string,
	showLink: boolean,
	linkText: string,
	imageFeed: string[],
	owner: string
}

export interface EventDBModelPrivate extends EventDBModel {
	owner: string
}

export interface CalendarDBModel extends RecordModel {
	name: string,
	password: string,
	passwordEnabled: boolean,
	owner: string,
	logo: string,
	visits: number,
	filters: unknown,
	description: string,
	passwordScreenMessage: string,
	displaySettings: CalendarCustomizations,
	created: string,
	updated: string
}

export interface ImageFeedDBModel extends RecordModel {
	name: string,
	owner: string,
	logo: string,
	visits: number,
	description: string,
	displaySettings: ImageFeedCustomizations,
	created: string,
	updated: string,
	filters: ImageFeedFilters
}

export interface EventListDBModel extends RecordModel {
	name: string,
	owner: string,
	logo: string,
	visits: number,
	description: string,
	displaySettings: ImageListCustomizations,
	created: string,
	updated: string,
	filters: ImageFeedFilters
}

// Dont you dare judge
export function toggleFullScreen() {
	const elem = document.documentElement
	// ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
	//@ts-ignore
	if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
		//@ts-ignore
		if (elem.requestFullScreen) {
			//@ts-ignore
			elem.requestFullScreen();
			//@ts-ignore
		} else if (elem.mozRequestFullScreen) {
			//@ts-ignore
			elem.mozRequestFullScreen();//@ts-ignore
		} else if (elem.webkitRequestFullScreen) {//@ts-ignore
			elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);//@ts-ignore
		} else if (elem.msRequestFullscreen) {//@ts-ignore
			elem.msRequestFullscreen();//@ts-ignore
		}
	} else {//@ts-ignore
		if (document.cancelFullScreen) {//@ts-ignore
			document.cancelFullScreen();//@ts-ignore
		} else if (document.mozCancelFullScreen) {//@ts-ignore
			document.mozCancelFullScreen();//@ts-ignore
		} else if (document.webkitCancelFullScreen) {//@ts-ignore
			document.webkitCancelFullScreen();//@ts-ignore
		} else if (document.msExitFullscreen) {//@ts-ignore
			document.msExitFullscreen();
		}
	}
}

export type CalendarCustomizations = {
	useAMPM: boolean,
    showResourcePathname: boolean,
	onlyShowLocationTitle: boolean,
	showLocation: boolean,
	showResources: boolean,
	showRooms: boolean,
	showDescription: boolean
}

export type ImageFeedCustomizations = {
	showEventExtraInfo: boolean,
	showEventName: boolean,
	showEventDescription: boolean,
	showEventRegistration: boolean,
	feedDurationMS: number,
	feedAnimationType: "slideshow" | "list",
}

export type ImageListCustomizations = {
	showEventName: boolean,
	showEventDescription: boolean,
	showEventRegistration: boolean,
	showUpcomingEventsTextAndDesc: boolean,
	setTransparentBackground: boolean
}

export const defaultImageListCustomizations: ImageListCustomizations = {
	showEventName: true,
	showEventDescription: true,
	showEventRegistration: true,
	showUpcomingEventsTextAndDesc: false,
	setTransparentBackground: false
}

export const defaultImageFeedCustomizations: ImageFeedCustomizations = {
	showEventExtraInfo: false,
	showEventName: true,
	showEventDescription: true,
	showEventRegistration: true,
	feedDurationMS: 7000,
	feedAnimationType: "slideshow"
}

export type ImageFeedFilters = {
	onlyShowFeatured: boolean,
	hideUnpublished: boolean
}

export interface UserModel extends RecordModel {
	userEmail: string,
	username: string,
	name: string,
	avatar: string,
	subscriptionEmail: string
	customerId: string,
	priceId: string,
	new: boolean,
	authToken: string,
	refreshToken: string,
	accessLevel: "none" | "standard" | "premium",
	refreshTokenExpires: number,
	accessTokenExpires: number
}

export function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Handle non-string inputs or empty strings
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}