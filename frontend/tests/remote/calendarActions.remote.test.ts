import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { catchRedirect, SchemaValidationError, setRequestEvent } from "../helpers/mock-app";
import { FakePB, type PBRecord } from "../helpers/fake-pb";

// Importing helpers/mock-app registers the $app/server + $app/environment mocks.
// The remote modules must be imported AFTER that with a dynamic import, because
// bun's mock.module only applies to modules loaded after registration.
const remote =
	(await import("../../src/routes/(mainWebsite)/dashboard/calendars/calendarActions.remote.ts")) as unknown as {
		createCalendarCommand: (input: unknown) => Promise<unknown>;
		deleteCalendarCommand: (input: unknown) => Promise<unknown>;
		updateCalendarForm: (input: unknown) => Promise<unknown>;
	};
const { createCalendarCommand, deleteCalendarCommand, updateCalendarForm } = remote;

let pb: FakePB;

function logIn(user: PBRecord = { id: "user-1", accessLevel: "standard" }) {
	setRequestEvent({
		locals: { pb, user },
		url: new URL("http://localhost:5173/dashboard/calendars"),
		cookies: new Map()
	});
}

beforeEach(() => {
	pb = new FakePB();
	logIn();
});

afterEach(() => setRequestEvent(undefined));

describe("createCalendarCommand", () => {
	const validInput = () => ({
		publicId: "main",
		name: "Main Calendar",
		description: "Weekly services",
		enablePassword: false,
		newPassword: ""
	});

	test("rejects public ids with spaces or special characters", async () => {
		const input = { ...validInput(), publicId: "has space!" };
		expect(createCalendarCommand(input)).rejects.toBeInstanceOf(SchemaValidationError);
	});

	test("rejects missing names", async () => {
		const input = { ...validInput(), name: "" };
		expect(createCalendarCommand(input)).rejects.toBeInstanceOf(SchemaValidationError);
	});

	test("returns No User when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		const result = await createCalendarCommand(validInput());
		expect(result).toEqual({ error: true, msg: "No User." });
	});

	test("blocks free users who already own a calendar", async () => {
		logIn({ id: "user-1", accessLevel: "none" });
		pb.seed("calendars", [{ id: "c1", owner: "user-1", name: "Existing" }]);
		const result = await createCalendarCommand(validInput());
		expect(result).toEqual({
			error: true,
			msg: "Exceed the amount of calendars on the free plan."
		});
	});

	test("rejects a public id that is already taken", async () => {
		pb.seed("calendars", [{ id: "c1", owner: "user-1", publicId: "main", name: "Existing" }]);
		const result = await createCalendarCommand(validInput());
		expect(result).toEqual({ error: true, msg: "Calendar URL path already taken." });
	});

	test("creates the calendar with default settings", async () => {
		const result = await createCalendarCommand(validInput());
		expect(result).toEqual({ error: false, msg: "Successfully created calendar." });

		const calendars = await pb.collection("calendars").getFullList();
		expect(calendars).toHaveLength(1);
		const created = calendars[0] as PBRecord;
		expect(created.publicId).toBe("main");
		expect(created.owner).toBe("user-1");
		expect(created.displaySettings.viewType).toBe("3day");
		expect(created.filters.onlyShowFeatured).toBe(true);
	});

	test("stores the password when password protection is enabled", async () => {
		const input = { ...validInput(), enablePassword: true, newPassword: "secret" };
		await createCalendarCommand(input);
		const calendars = await pb.collection("calendars").getFullList();
		expect((calendars[0] as PBRecord).password).toBe("secret");
		expect((calendars[0] as PBRecord).passwordEnabled).toBe(true);
	});
});

describe("updateCalendarForm", () => {
	const input = () => ({
		id: "c1",
		publicId: "main",
		name: "Renamed Calendar",
		description: "Updated description",
		enablePassword: false,
		displaySettings: {
			viewType: "week",
			useAMPM: true,
			showResourcePathname: false,
			onlyShowLocationTitle: false,
			showLocation: true,
			showResources: true,
			showRooms: true,
			showDescription: false
		},
		filters: {
			resourceFilterType: "block",
			tagFilterType: "block",
			onlyShowFeatured: true,
			hideUnpublished: true,
			allowResources: [],
			blockResources: [],
			enableResourceFiltering: false,
			allowTags: [],
			blockTags: [],
			enableTagFiltering: false
		}
	});

	test("redirects to the home page when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		const thrown = await catchRedirect(updateCalendarForm(input()));
		expect(thrown.location).toBe("/");
	});

	test("updates the calendar for the owner", async () => {
		pb.seed("calendars", [
			{
				id: "c1",
				owner: "user-1",
				publicId: "main",
				name: "Old Name",
				displaySettings: {},
				filters: {}
			}
		]);
		const result = await updateCalendarForm(input());
		expect(result).toEqual({ error: false, msg: "Successfully updated calendar." });

		const updated = await pb.collection("calendars").getOne("c1");
		expect(updated.name).toBe("Renamed Calendar");
		expect(updated.displaySettings.viewType).toBe("week");
	});

	test("reports a taken public id as an invalid form field", async () => {
		pb.seed("calendars", [
			{
				id: "c1",
				owner: "user-1",
				publicId: "main",
				name: "Old",
				displaySettings: {},
				filters: {}
			},
			{ id: "c2", owner: "user-1", publicId: "taken", name: "Other" }
		]);
		// The real `invalid(...)` from @sveltejs/kit THROWS a ValidationError.
		expect(async () => await updateCalendarForm({ ...input(), publicId: "taken" })).toThrow();
	});
});

describe("deleteCalendarCommand", () => {
	test("returns No User when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		expect(await deleteCalendarCommand("c1")).toEqual({ error: true, msg: "No User." });
	});

	test("deletes the calendar for the owner", async () => {
		pb.seed("calendars", [{ id: "c1", owner: "user-1", name: "Doomed" }]);
		const result = await deleteCalendarCommand("c1");
		expect(result).toEqual({ error: false, msg: "Successfully deleted calendar." });
		expect(await pb.collection("calendars").getFullList()).toHaveLength(0);
	});

	test("swallows pocketbase errors into an internal server error", async () => {
		pb.seed("calendars", [{ id: "c1", owner: "user-1", name: "Doomed" }]);
		pb.failNextDelete = true;
		const result = await deleteCalendarCommand("c1");
		expect(result).toEqual({ error: true, msg: "Internal Server Error." });
	});
});
