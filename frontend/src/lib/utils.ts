import { clsx, type ClassValue } from "clsx";
import type { RecordModel } from "pocketbase";
import { toast } from "svelte-sonner";
import { twMerge } from "tailwind-merge";
import { invalidateAll } from "$app/navigation";
import { Temporal } from "temporal-polyfill";
import { updateSpecificUserEvents } from "../routes/(mainWebsite)/dashboard/backend.remote";

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

export interface CustomImageIFeedDBModel extends RecordModel {
	picture: string | File,
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
	logo: string | File,
	visits: number,
	filters: CalendarFilters,
	description: string,
	passwordScreenMessage: string,
	displaySettings: CalendarCustomizations,
	created: string,
	updated: string
}

export interface ImageFeedDBModel extends RecordModel {
	name: string,
	owner: string,
	logo: string | File,
	visits: number,
	description: string,
	displaySettings: ImageFeedCustomizations,
	created: string,
	updated: string,
	filters: ImageFeedFilters,
	additionalCalendars: string[]
}

export interface EventListDBModel extends RecordModel {
	name: string,
	owner: string,
	logo: string | File,
	visits: number,
	description: string,
	displaySettings: ImageListCustomizations,
	created: string,
	updated: string,
	filters: EventListFilters
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
	viewType: "3day" | "week" | "month",
	useAMPM: boolean,
    showResourcePathname: boolean,
	onlyShowLocationTitle: boolean,
	showLocation: boolean,
	showResources: boolean,
	showRooms: boolean,
	showDescription: boolean
}

export const defaultCalendarCustomizations: CalendarCustomizations = {
	viewType: "3day",
	useAMPM: true,
	showResourcePathname: false,
	onlyShowLocationTitle: false,
	showLocation: true,
	showResources: true,
	showRooms: true,
	showDescription: false
}

export type CalendarFilters = {
	onlyShowFeatured: boolean,
	hideUnpublished: boolean
};

export type ImageFeedCustomizations = {
	showEventExtraInfo: boolean,
	showEventName: boolean,
	showEventDescription: boolean,
	showEventRegistration: boolean,
	feedDurationMS: number,
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
}

export type ImageFeedFilters = {
	onlyShowFeatured: boolean,
	hideUnpublished: boolean,
	hideRecurringEvents: boolean,
}

export type EventListFilters = ImageFeedFilters;

export const defaultImageFeedFilters: ImageFeedFilters = {
	onlyShowFeatured: true,
	hideUnpublished: true,
	hideRecurringEvents: false,
}

export const defaultEventListFilters: EventListFilters = {
	onlyShowFeatured: true,
	hideUnpublished: true,
	hideRecurringEvents: false,
}

export interface UserModel extends RecordModel {
	// userEmail: string,
	// username: string,
	name: string,
	avatar: string,
	// subscriptionEmail: string
	customerId: string,
	priceId: string,
	new: boolean,
	// authToken: string,
	// refreshToken: string,
	accessLevel: "none" | "standard" | "premium",
	// refreshTokenExpires: number,
	// accessTokenExpires: number
	// lastEventsFetch: string
	subscriptionURL: string
	freeTrialURL: string
}

export interface IntegrationModel extends RecordModel {
	prettyName: string,
	owner: string,
	service: "planningcenter" | "breeze" | "google" | "outlook"
	refreshToken: string,
	accessToken: string,
	refreshTokenExpires: number,
	accessTokenExpires: number
	lastEventsFetch: string,
	status: "connected" | "syncing" | "error" | "disconnected"
}

export function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Handle non-string inputs or empty strings
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function timeAgo(dateParam: Date | string | number) {
    if (!dateParam) {
        return null;
    }

    const date = new Date(dateParam); // Ensure it's a Date object
    const now = new Date();
	//@ts-ignore
    const diffInMs = now - date; // Difference in milliseconds

    const seconds = Math.round(diffInMs / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    // Less than a minute ago
    if (seconds < 60) {
        return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    }
    // Less than an hour ago
    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    // Less than 24 hours ago (a day ago)
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    // Less than a month ago (e.g., 1 day ago, 5 days ago)
    if (days < 30) { // Approximating a month as 30 days
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    // Older than a month, return formatted date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

	//@ts-ignore
    return date.toLocaleDateString(undefined, options); // Use default locale
}

export function timeWhen(dateParam: Date | string | number) {
    if (!dateParam) {
        return null;
    }

    const date = new Date(dateParam); // Ensure it's a Date object
    const now = new Date();
	//@ts-ignore
    const diffInMs = date - now; // Difference in milliseconds

    const seconds = Math.round(diffInMs / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    // Less than a minute ago
    if (seconds < 60) {
        return `${seconds} second${seconds === 1 ? '' : 's'}`;
    }
    // Less than an hour ago
    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    // Less than 24 hours ago (a day ago)
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    // Less than a month ago (e.g., 1 day ago, 5 days ago)
    if (days < 30) { // Approximating a month as 30 days
        return `${days} day${days === 1 ? '' : 's'}`;
    }

    // Older than a month, return formatted date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

	//@ts-ignore
    return date.toLocaleDateString(undefined, options); // Use default locale
}

export async function refreshingEvents() {
	const refreshingToast = toast.loading("Refreshing events.");
	const response = await updateSpecificUserEvents();
	toast.dismiss(refreshingToast);
	if (response.error) {
		toast.error(response.msg);
	} else {
		toast.success(response.msg);
	}
}

export function getDaysInMonth(date: Temporal.ZonedDateTime): Temporal.ZonedDateTime[] {
	const firstDay = date.with({ day: 1 });
	const lastDay = date.with({ day: date.daysInMonth });
	
	const days: Temporal.ZonedDateTime[] = [];
	
	// Add days from previous month to start on Sunday
	const startDayOfWeek = firstDay.dayOfWeek !== 7 ? firstDay.dayOfWeek : 0;

	for (let i = startDayOfWeek; i >= 1; i--) {
		const prevDate = firstDay.subtract({ days: i }).startOfDay() //new Date(year, month, -i)
		days.push(prevDate)
	}
	
	// Add days of current month
	for (let i = 0; i <= lastDay.day - 1; i++) {
		days.push(firstDay.add({ days: i }));
	}

	let rowsRequired = 6;
	if (days.length <= 35) {
		rowsRequired -= 1;
	}

	if (days.length <= 28) {
		rowsRequired -= 1;
	}

	// Add days from next month to complete the grid
	const remainingDays = (rowsRequired * 7) - days.length;

	for (let i = 1; i <= remainingDays; i++) {
		days.push(lastDay.add({ days: i }).startOfDay());
	}

	return days
}

export function getDayRange(startDate: Temporal.ZonedDateTime, days: number): Temporal.ZonedDateTime[] {
	const range: Temporal.ZonedDateTime[] = []
	for (let i = 0; i < days; i++) {
		range.push(startDate.add({ days: i }));
	}
	return range
}

export function isSameDay(date1: Temporal.ZonedDateTime, date2: Temporal.ZonedDateTime): boolean {
	return (
		date1.year === date2.year &&
		date1.month === date2.month &&
		date1.day === date2.day
	)
}

export function getEventsForDate(events: EventDBModel[], day: Temporal.ZonedDateTime, nextDay: Temporal.ZonedDateTime): EventDBModel[] {
	return events.filter((event) => {
		return dateRangeOverlaps(day.toInstant().epochMilliseconds, nextDay.toInstant().epochMilliseconds, (new Date(event.startTime)).valueOf(), (new Date(event.endTime)).valueOf())
	})
}

export type WeekSheetTimeSlot = {
    startMinute: number;
    endMinute: number;
    link: string;
}

export type URLRefHits = { name: string, hits: number }

export interface DynamicURLModel extends RecordModel {
	owner: string,
	defaultRedirectTo: string
	timeZone: Temporal.TimeZoneLike
	weekSheet: WeekSheetTimeSlot[][],
	enableWeekSheet: boolean,
	overrideRedirectTo: string
	enableOverrideRedirect: boolean,
	disableURL: boolean;
	refs: URLRefHits[]
}

export const TIMEZONES = [
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/Phoenix",
	"America/Anchorage",
	"Pacific/Honolulu",
	"Europe/London",
	"Europe/Paris",
	"Europe/Berlin",
	"Europe/Moscow",
	"Asia/Tokyo",
	"Asia/Seoul",
	"Asia/Shanghai",
	"Asia/Kolkata",
	"Asia/Dubai",
	"Australia/Sydney",
	"Australia/Perth",
	"America/Sao_Paulo",
	"Africa/Johannesburg"
];

export interface AvailableIntegration {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: IntegrationModel["service"];
  docsUrl: string;
  comingSoon: boolean
}

export const availableIntegrations: AvailableIntegration[] = [
	{
		id: "planningcenter",
		name: "Planning Center",
		slug: "planningcenter",
		description: "Sync events from Planning Center Calendar. Automatically imports services, events, and schedules.",
		icon: "planningcenter",
		docsUrl: "https://www.planningcenter.com/",
		comingSoon: false,
	},
	{
		id: "breeze",
		name: "Breeze ChMS",
		slug: "breeze",
		description: "Connect with Breeze Church Management to sync your church events and calendar.",
		icon: "breeze",
		docsUrl: "https://www.breezechms.com/",
		comingSoon: true,
	},
	{
		id: "googlecalendar",
		name: "Google Calendar",
		slug: "google-calendar",
		description: "Import events from Google Calendar. Supports multiple calendars and automatic sync.",
		icon: "google",
		docsUrl: "https://calendar.google.com/",
		comingSoon: true,
	},
	{
		id: "outlook",
		name: "Outlook Calendar",
		slug: "outlook",
		description: "Sync events from Microsoft Outlook and Office 365 calendars.",
		icon: "outlook",
		docsUrl: "https://outlook.com/",
		comingSoon: true,
	},
];