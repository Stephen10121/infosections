import { afterAll, afterEach, beforeAll, describe, expect, setSystemTime, test } from "bun:test";
import { Temporal } from "temporal-polyfill";
import { registerAppMocks } from "../helpers/mock-app";

// Register the $app/* + svelte-sonner mocks BEFORE importing @/utils, which
// transitively imports events.remote (-> $app/server) and svelte-sonner (toast).
registerAppMocks();

// Pin the local timezone so `new Date().getHours()` is deterministic.
process.env.TZ = "UTC";

const utils = await import("@/utils");
const {
	cn,
	dateRangeOverlaps,
	capitalizeFirstLetter,
	timeAgo,
	timeWhen,
	getGreeting,
	timeRemaining,
	getDaysInMonth,
	getDayRange,
	isSameDay,
	getEventsForDate,
	generateIframeCode,
	hasKey,
	fetchFileFromURL,
	LONGDAYTOSTRING,
	MONTHTOSTRING,
	TIMEZONES,
	availableIntegrations,
	errorTypes,
	defaultImageListCustomizations,
	defaultImageFeedCustomizations,
	defaultImageFeedFilters,
	defaultEventListFilters
} = utils;

// Pin time so time-sensitive functions are deterministic.
beforeAll(() => {
	setSystemTime(new Date("2025-01-15T14:00:00Z"));
});

afterAll(() => {
	setSystemTime();
});

describe("cn", () => {
	test("joins class names", () => {
		expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
	});

	test("drops falsy values", () => {
		expect(cn("foo", "", null, undefined, false, "bar")).toBe("foo bar");
	});

	test("resolves tailwind conflicts with twMerge (last wins)", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
	});
});

describe("dateRangeOverlaps", () => {
	test("b starts inside a", () => {
		expect(dateRangeOverlaps(0, 10, 5, 15)).toBe(true);
	});

	test("b ends inside a", () => {
		expect(dateRangeOverlaps(5, 15, 0, 10)).toBe(true);
	});

	test("a is fully inside b", () => {
		expect(dateRangeOverlaps(5, 10, 0, 15)).toBe(true);
	});

	test("b fully inside a", () => {
		expect(dateRangeOverlaps(0, 15, 5, 10)).toBe(true);
	});

	test("adjacent but non-overlapping ranges", () => {
		expect(dateRangeOverlaps(0, 10, 10, 20)).toBe(true); // inclusive end
		expect(dateRangeOverlaps(0, 9, 10, 20)).toBe(false);
	});
});

describe("capitalizeFirstLetter", () => {
	test("capitalizes a lowercase word", () => {
		expect(capitalizeFirstLetter("hello")).toBe("Hello");
	});

	test("leaves already-capitalized words untouched", () => {
		expect(capitalizeFirstLetter("Hello")).toBe("Hello");
	});

	test("handles empty strings", () => {
		expect(capitalizeFirstLetter("")).toBe("");
	});

	test("does not crash on non-string input", () => {
		// Deliberately passing `undefined` to exercise the runtime guard; TS won't
		// type-check it, so we widen the signature for this call.
		const call = capitalizeFirstLetter as (s: string | undefined) => string | undefined;
		expect(call(undefined)).toBe(undefined);
	});
});

describe("timeAgo", () => {
	test("returns null for falsy input", () => {
		const call = timeAgo as (d: string | number | Date | undefined) => string | null;
		expect(call(undefined)).toBe(null);
		expect(timeAgo("")).toBe(null);
	});

	test("seconds ago", () => {
		expect(timeAgo(new Date("2025-01-15T13:59:40Z"))).toBe("20 seconds ago");
	});

	test("singular minute", () => {
		expect(timeAgo(new Date("2025-01-15T13:59:00Z"))).toBe("1 minute ago");
	});

	test("plural minutes", () => {
		expect(timeAgo(new Date("2025-01-15T13:30:00Z"))).toBe("30 minutes ago");
	});

	test("hours", () => {
		expect(timeAgo("2025-01-15T12:30:00Z")).toBe("2 hours ago");
	});

	test("days", () => {
		expect(timeAgo("2025-01-14T14:00:00Z")).toBe("1 day ago");
	});

	test("older than a month returns a formatted date", () => {
		const result = timeAgo("2024-12-01T14:00:00Z");
		expect(result).not.toMatch(/ ago$/);
		expect(result).toContain("2024");
	});
});

describe("timeWhen", () => {
	test("returns null for falsy input", () => {
		const call = timeWhen as (d: string | number | Date | undefined) => string | null;
		expect(call(undefined)).toBe(null);
	});

	test("future minutes", () => {
		expect(timeWhen(new Date("2025-01-15T14:30:00Z"))).toBe("30 minutes");
	});

	test("future singular hour", () => {
		expect(timeWhen(new Date("2025-01-15T15:00:00Z"))).toBe("1 hour");
	});

	test("future days", () => {
		expect(timeWhen("2025-01-17T14:00:00Z")).toBe("2 days");
	});
});

describe("getGreeting", () => {
	// Each test moves the system clock; roll it back so following tests are stable.
	afterEach(() => {
		setSystemTime(new Date("2025-01-15T14:00:00Z"));
	});

	test("before noon is morning", () => {
		setSystemTime(new Date("2025-01-15T09:00:00Z"));
		expect(getGreeting()).toBe("Good morning");
	});

	test("noon to 5pm is afternoon", () => {
		setSystemTime(new Date("2025-01-15T14:00:00Z"));
		expect(getGreeting()).toBe("Good afternoon");
	});

	test("5pm onwards is evening", () => {
		setSystemTime(new Date("2025-01-15T20:00:00Z"));
		expect(getGreeting()).toBe("Good evening");
	});
});

describe("timeRemaining", () => {
	test("expired for past dates", () => {
		expect(timeRemaining("2025-01-15T13:00:00Z")).toBe("expired");
	});

	test("minutes-only below an hour", () => {
		expect(timeRemaining("2025-01-15T14:30:00Z")).toBe("30m");
	});

	test("hours and minutes above an hour", () => {
		expect(timeRemaining("2025-01-15T15:30:00Z")).toBe("1h 30m");
	});
});

describe("getDaysInMonth", () => {
	test("March 2025 renders a full 6-row grid (42 cells) starting on a Sunday", () => {
		const march = Temporal.ZonedDateTime.from({
			year: 2025,
			month: 3,
			day: 15,
			hour: 0,
			timeZone: "UTC"
		});
		const days = getDaysInMonth(march);
		expect(days).toHaveLength(42);
		expect(days[0]!.day).toBe(23);
		expect(days[0]!.month).toBe(2);
		expect(days[41]!.day).toBe(5);
		expect(days[41]!.month).toBe(4);
	});

	test("February 2025 renders a 5-row grid (35 cells)", () => {
		const feb = Temporal.ZonedDateTime.from({
			year: 2025,
			month: 2,
			day: 15,
			hour: 0,
			timeZone: "UTC"
		});
		const days = getDaysInMonth(feb);
		expect(days).toHaveLength(35);
	});

	test("pad days borrowed from adjacent months are normalised to the start of day", () => {
		const june = Temporal.ZonedDateTime.from({
			year: 2025,
			month: 6,
			day: 15,
			hour: 8,
			timeZone: "UTC"
		});
		const days = getDaysInMonth(june);
		// The grid starts on a Sunday and ends on a Saturday; those pad days are
		// either before the 1st or after the last day of the month.
		const padDays = days.filter((day) => day.month !== 6);
		expect(padDays.length).toBeGreaterThan(0);
		for (const day of padDays) {
			expect(day.hour).toBe(0);
			expect(day.minute).toBe(0);
		}
	});
});

describe("getDayRange", () => {
	test("returns `days` consecutive days from the start", () => {
		const start = Temporal.ZonedDateTime.from({
			year: 2025,
			month: 1,
			day: 10,
			hour: 0,
			timeZone: "UTC"
		});
		const range = getDayRange(start, 7);
		expect(range).toHaveLength(7);
		expect(range[0]!.day).toBe(10);
		expect(range[6]!.day).toBe(16);
	});

	test("empty range for zero days", () => {
		const start = Temporal.ZonedDateTime.from({
			year: 2025,
			month: 1,
			day: 10,
			hour: 0,
			timeZone: "UTC"
		});
		expect(getDayRange(start, 0)).toHaveLength(0);
	});
});

describe("isSameDay", () => {
	const day1 = Temporal.ZonedDateTime.from({
		year: 2025,
		month: 3,
		day: 10,
		hour: 8,
		timeZone: "UTC"
	});
	const day1Late = Temporal.ZonedDateTime.from({
		year: 2025,
		month: 3,
		day: 10,
		hour: 23,
		timeZone: "UTC"
	});
	const day2 = Temporal.ZonedDateTime.from({
		year: 2025,
		month: 3,
		day: 11,
		hour: 1,
		timeZone: "UTC"
	});

	test("true for the same calendar day", () => {
		expect(isSameDay(day1, day1Late)).toBe(true);
	});

	test("false for different days", () => {
		expect(isSameDay(day1, day2)).toBe(false);
	});
});

describe("getEventsForDate", () => {
	const day = Temporal.ZonedDateTime.from({
		year: 2025,
		month: 1,
		day: 10,
		hour: 0,
		timeZone: "UTC"
	});
	const nextDay = day.add({ days: 1 });

	function ev(id: string, start: string, end: string) {
		return { id, startTime: start, endTime: end } as any;
	}

	test("includes events that overlap the day", () => {
		const inside = ev("inside", "2025-01-10T10:00:00", "2025-01-10T12:00:00");
		const spanning = ev("spanning", "2025-01-09T23:00:00", "2025-01-10T01:00:00");
		const outside = ev("outside", "2025-01-11T10:00:00", "2025-01-11T12:00:00");
		const result = getEventsForDate([inside, spanning, outside], day, nextDay);
		expect(result.map((e) => e.id).sort()).toEqual(["inside", "spanning"]);
	});
});

describe("generateIframeCode", () => {
	test("includes the resize observer script by default", () => {
		const code = generateIframeCode(
			"https://cal.example/abc",
			"My Calendar",
			"abc",
			"https://is.example"
		);
		expect(code).toContain('<script async src="https://is.example/resizeObserver.js">');
		expect(code).toContain("<iframe");
		expect(code).toContain('src="https://cal.example/abc"');
		expect(code).toContain('id="iframeabc"');
		expect(code).toContain('title="My Calendar"');
	});

	test("omits the script when removeScript is true", () => {
		const code = generateIframeCode(
			"https://cal.example/abc",
			"My Calendar",
			"abc",
			"https://is.example",
			true
		);
		expect(code).not.toContain("<script");
		expect(code).toContain("<iframe");
	});
});

describe("hasKey", () => {
	test("returns true when the key exists", () => {
		expect(hasKey({ a: 1 }, "a")).toBe(true);
	});

	test("returns false when the key is missing", () => {
		expect(hasKey({ a: 1 }, "b")).toBe(false);
	});
});

describe("fetchFileFromURL", () => {
	const originalFetch = globalThis.fetch;

	afterAll(() => {
		globalThis.fetch = originalFetch;
	});

	test("returns the fetched blob on success", async () => {
		globalThis.fetch = (async () =>
			({
				blob: async () => new Blob(["hello"], { type: "text/plain" })
			}) as unknown as Response) as unknown as typeof globalThis.fetch;
		const result = await fetchFileFromURL("https://files.example/a.txt");
		expect(result.error).toBe(false);
		expect((result as { blob: Blob }).blob.size).toBe(5);
	});

	test("returns an error object when the fetch throws", async () => {
		globalThis.fetch = (async () => {
			throw new Error("network down");
		}) as unknown as typeof globalThis.fetch;
		const result = await fetchFileFromURL("https://files.example/a.txt");
		expect(result.error).toBe(true);
	});
});

describe("exported constants and defaults", () => {
	test("LONGDAYTOSTRING has 8 entries with Sunday first and last", () => {
		expect(LONGDAYTOSTRING).toHaveLength(8);
		expect(LONGDAYTOSTRING[0]).toBe("Sunday");
		expect(LONGDAYTOSTRING[7]).toBe("Sunday");
	});

	test("MONTHTOSTRING has 13 entries (index 0 is empty)", () => {
		expect(MONTHTOSTRING).toHaveLength(13);
		expect(MONTHTOSTRING[0]).toBe("");
		expect(MONTHTOSTRING[1]).toBe("Jan");
		expect(MONTHTOSTRING[12]).toBe("Dec");
	});

	test("default image feed customizations", () => {
		expect(defaultImageFeedCustomizations).toEqual({
			showEventExtraInfo: false,
			showEventName: true,
			showEventDescription: true,
			showEventRegistration: true,
			feedDurationMS: 7000
		});
	});

	test("default event list customizations", () => {
		expect(defaultImageListCustomizations).toEqual({
			displayStyle: "minimal",
			showEventName: true,
			showEventDescription: true,
			showEventRegistration: true,
			showUpcomingEventsTextAndDesc: false,
			setTransparentBackground: false
		});
	});

	test("default feed filters", () => {
		expect(defaultImageFeedFilters).toEqual({
			onlyShowFeatured: true,
			hideUnpublished: true,
			hideRecurringEvents: false
		});
		expect(defaultEventListFilters).toEqual({
			onlyShowFeatured: true,
			hideUnpublished: true,
			hideRecurringEvents: false
		});
	});

	test("availableIntegrations contains the expected providers", () => {
		expect(availableIntegrations.map((i) => i.id).sort()).toEqual(
			["breeze", "googlecalendar", "planningcenter", "twitter"].sort()
		);
		const pco = availableIntegrations.find((i) => i.id === "planningcenter");
		expect(pco?.comingSoon).toBe(false);
		const breeze = availableIntegrations.find((i) => i.id === "breeze");
		expect(breeze?.comingSoon).toBe(true);
	});

	test("every timezone is a valid IANA timezone", () => {
		// Use the platform tz database instead of the polyfill: the bun-resolved
		// build of temporal-polyfill does not expose Temporal.TimeZone.
		for (const tz of TIMEZONES) {
			expect(() => new Intl.DateTimeFormat("en-US", { timeZone: tz })).not.toThrow();
		}
	});

	test("errorTypes maps every error key to a string", () => {
		for (const [, message] of Object.entries(errorTypes)) {
			expect(typeof message).toBe("string");
		}
	});
});
