import { describe, expect, test } from "bun:test";
import {
	defaultCalendarCustomizations,
	defaultCalendarFilters,
	type CalendarCustomizations,
	type CalendarFilters
} from "@/cal.utils";

describe("defaultCalendarCustomizations", () => {
	test("matches the out-of-the-box display settings", () => {
		const expected: CalendarCustomizations = {
			viewType: "3day",
			useAMPM: true,
			showResourcePathname: false,
			onlyShowLocationTitle: false,
			showLocation: true,
			showResources: true,
			showRooms: true,
			showDescription: false
		};
		expect(defaultCalendarCustomizations).toEqual(expected);
	});

	test("viewType is one of the supported options", () => {
		expect(["3day", "week", "month"]).toContain(defaultCalendarCustomizations.viewType);
	});
});

describe("defaultCalendarFilters", () => {
	test("matches the default filter settings", () => {
		const expected: CalendarFilters = {
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
		expect(defaultCalendarFilters).toEqual(expected);
	});

	test("resource/tag filtering is disabled by default", () => {
		expect(defaultCalendarFilters.enableResourceFiltering).toBe(false);
		expect(defaultCalendarFilters.enableTagFiltering).toBe(false);
	});
});
