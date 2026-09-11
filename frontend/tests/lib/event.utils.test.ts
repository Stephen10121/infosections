import { describe, expect, test } from "bun:test";
import {
	eventResourceAllowListToFilterString,
	eventResourceBlockListToFilterString,
	eventTagAllowListToFilterString,
	eventTagBlockListToFilterString,
	filterEventsBasedOnTagAndResourceFilters,
	eventFieldRequirementsPublic,
	tagsExpandRequirementsPublic,
	resourcesExpandRequirementsPublic,
	type EventDBModelExpanded
} from "@/event.utils";
import { defaultCalendarFilters, type CalendarFilters } from "@/cal.utils";

function makeEvent(overrides: Partial<EventDBModelExpanded> = {}): EventDBModelExpanded {
	return {
		id: "id1",
		collectionId: "c",
		collectionName: "events",
		recEventId: "rec1",
		name: "Test Event",
		description: "",
		imageURL: "",
		registrationURL: "",
		location: "",
		times: null,
		startTime: "2025-01-01 09:00:00",
		endTime: "2025-01-01 10:00:00",
		featured: false,
		visibleInChurchCenter: true,
		recurrence: "",
		service: "planningcenter",
		resources: null,
		tags: null,
		expand: { tags: null, resources: null },
		created: "2025-01-01",
		updated: "2025-01-01",
		...overrides
	};
}

function makeFilters(overrides: Partial<CalendarFilters> = {}): CalendarFilters {
	return { ...defaultCalendarFilters, ...overrides };
}

describe("eventResourceAllowListToFilterString", () => {
	test("empty list produces only the closing paren", () => {
		expect(eventResourceAllowListToFilterString([])).toBe(" )");
	});

	test("single resource opens a group", () => {
		expect(eventResourceAllowListToFilterString(["r1"])).toBe(' && ( resources ~ "r1" )');
	});

	test("multiple resources are OR-ed", () => {
		expect(eventResourceAllowListToFilterString(["r1", "r2"])).toBe(
			' && ( resources ~ "r1" || resources ~ "r2" )'
		);
	});
});

describe("eventResourceBlockListToFilterString", () => {
	test("empty list produces an empty filter", () => {
		expect(eventResourceBlockListToFilterString([])).toBe("");
	});

	test("blocked resources are AND-ed", () => {
		expect(eventResourceBlockListToFilterString(["r1", "r2"])).toBe(
			' && resources !~ "r1" && resources !~ "r2"'
		);
	});
});

describe("eventTagAllowListToFilterString", () => {
	test("single tag opens a group", () => {
		expect(eventTagAllowListToFilterString(["t1"])).toBe(' && ( tags ~ "t1" )');
	});

	test("multiple tags are OR-ed", () => {
		expect(eventTagAllowListToFilterString(["t1", "t2"])).toBe(
			' && ( tags ~ "t1" || tags ~ "t2" )'
		);
	});
});

describe("eventTagBlockListToFilterString", () => {
	test("blocked tags are AND-ed", () => {
		expect(eventTagBlockListToFilterString(["t1", "t2"])).toBe(' && tags !~ "t1" && tags !~ "t2"');
	});
});

describe("filterEventsBasedOnTagAndResourceFilters", () => {
	const withResource = (resource: string) => makeEvent({ resources: [resource] });
	const withTag = (tag: string) => makeEvent({ tags: [tag] });

	test("returns everything when no filtering is enabled", () => {
		const events = [withResource("r1"), withResource("r2")];
		const result = filterEventsBasedOnTagAndResourceFilters(events, makeFilters());
		expect(result).toHaveLength(2);
	});

	test("resource allow list keeps events with an allowed resource", () => {
		const events = [withResource("r1"), withResource("r2"), makeEvent({ resources: null })];
		const result = filterEventsBasedOnTagAndResourceFilters(
			events,
			makeFilters({
				enableResourceFiltering: true,
				resourceFilterType: "allow",
				allowResources: ["r2"]
			})
		);
		expect(result).toHaveLength(1);
		expect(result[0]!.resources).toEqual(["r2"]);
	});

	test("resource allow list with no allowed resources keeps nothing", () => {
		const events = [withResource("r1")];
		const result = filterEventsBasedOnTagAndResourceFilters(
			events,
			makeFilters({
				enableResourceFiltering: true,
				resourceFilterType: "allow",
				allowResources: []
			})
		);
		expect(result).toHaveLength(0);
	});

	test("resource block list excludes blocked resources", () => {
		const events = [withResource("r1"), withResource("r2")];
		const result = filterEventsBasedOnTagAndResourceFilters(
			events,
			makeFilters({
				enableResourceFiltering: true,
				resourceFilterType: "block",
				blockResources: ["r1"]
			})
		);
		expect(result).toHaveLength(1);
		expect(result[0]!.resources).toEqual(["r2"]);
	});

	test("tag allow list keeps events with an allowed tag", () => {
		const events = [withTag("t1"), withTag("t2"), makeEvent({ tags: null })];
		const result = filterEventsBasedOnTagAndResourceFilters(
			events,
			makeFilters({
				enableTagFiltering: true,
				tagFilterType: "allow",
				allowTags: ["t1"]
			})
		);
		expect(result).toHaveLength(1);
		expect(result[0]!.tags).toEqual(["t1"]);
	});

	test("combination of resource AND tag filters requires both to pass", () => {
		const event = makeEvent({ resources: ["r1"], tags: ["t1"] });
		const blockedByTag = makeEvent({ resources: ["r1"], tags: ["t2"] });
		const blockedByResource = makeEvent({ resources: ["r2"], tags: ["t1"] });
		const events = [event, blockedByTag, blockedByResource];

		const result = filterEventsBasedOnTagAndResourceFilters(
			events,
			makeFilters({
				enableResourceFiltering: true,
				resourceFilterType: "allow",
				allowResources: ["r1"],
				enableTagFiltering: true,
				tagFilterType: "allow",
				allowTags: ["t1"]
			})
		);
		expect(result).toHaveLength(1);
		expect(result[0]!.id).toBe("id1");
	});

	test("events without resources/tags are excluded by allow filters but not block filters", () => {
		const bare = makeEvent({ resources: null, tags: null });
		expect(
			filterEventsBasedOnTagAndResourceFilters(
				[bare],
				makeFilters({
					enableResourceFiltering: true,
					resourceFilterType: "allow",
					allowResources: ["r1"]
				})
			)
		).toHaveLength(0);

		expect(
			filterEventsBasedOnTagAndResourceFilters(
				[bare],
				makeFilters({
					enableResourceFiltering: true,
					resourceFilterType: "block",
					blockResources: ["r1"]
				})
			)
		).toHaveLength(1);
	});
});

describe("public field requirement helpers", () => {
	test("define the fields the public API exposes for events", () => {
		expect(eventFieldRequirementsPublic).toContain("recEventId");
		expect(eventFieldRequirementsPublic).toContain("startTime");
		expect(eventFieldRequirementsPublic).not.toContain("expand");
		expect(tagsExpandRequirementsPublic).toContain("expand.tags.name");
		expect(resourcesExpandRequirementsPublic).toContain("expand.resources.quantity");
	});
});
