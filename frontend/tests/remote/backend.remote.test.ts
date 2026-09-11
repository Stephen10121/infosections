import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { catchRedirect, setRequestEvent } from "../helpers/mock-app";
import { FakePB, type PBRecord } from "../helpers/fake-pb";

// Importing helpers/mock-app registers the $app/server + $app/environment mocks.
// The remote modules must be imported AFTER that with a dynamic import, because
// bun's mock.module only applies to modules loaded after registration.
const remote = await import("../../src/routes/(mainWebsite)/dashboard/backend.remote.ts");
const {
	getCalendarById,
	getMyCalendars,
	getMyDynamicURLS,
	getMyEventLists,
	getMyImageFeeds,
	getMyIntegrations
} = remote;

let pb: FakePB;

function logIn(user: PBRecord = { id: "user-1" }) {
	setRequestEvent({
		locals: { pb, user },
		url: new URL("http://localhost:5173/dashboard"),
		cookies: new Map()
	});
}

beforeEach(() => {
	pb = new FakePB();
	logIn();
});

afterEach(() => setRequestEvent(undefined));

describe("list queries", () => {
	test("return empty lists when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		expect(await getMyIntegrations()).toEqual([]);
		expect(await getMyCalendars()).toEqual([]);
		expect(await getMyImageFeeds()).toEqual([]);
		expect(await getMyEventLists()).toEqual([]);
	});

	test("return seeded records for a logged-in user", async () => {
		pb.seed("integration", [{ id: "i1", owner: "user-1", service: "planningcenter" }]);
		pb.seed("calendars", [{ id: "c1", owner: "user-1", name: "Main" }]);
		pb.seed("imageFeeds", [{ id: "f1", owner: "user-1", name: "Foyer" }]);
		pb.seed("eventLists", [{ id: "l1", owner: "user-1", name: "Weekly" }]);

		expect(await getMyIntegrations()).toHaveLength(1);
		expect(await getMyCalendars()).toHaveLength(1);
		expect(await getMyImageFeeds()).toHaveLength(1);
		expect(await getMyEventLists()).toHaveLength(1);
	});

	test("list queries never throw when pocketbase is unavailable", async () => {
		// Nothing seeded -> the wrapped pocketbase call throws internally and the
		// handler catches it, returning the empty list it initialised with.
		expect(await getMyIntegrations()).toEqual([]);
		expect(await getMyCalendars()).toEqual([]);
	});
});

describe("getCalendarById", () => {
	test("redirects to the calendars page when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		const thrown = await catchRedirect(getCalendarById("c1"));
		expect((thrown.location as string) ?? "").toContain("/dashboard/calendars");
	});

	test("redirects when the record does not exist", async () => {
		const thrown = await catchRedirect(getCalendarById("missing"));
		expect((thrown.location as string) ?? "").toContain("/dashboard/calendars");
	});

	test("redirects when the user is not the owner", async () => {
		pb.seed("calendars", [{ id: "c1", owner: "someone-else", name: "Not yours" }]);
		const thrown = await catchRedirect(getCalendarById("c1"));
		expect((thrown.location as string) ?? "").toContain("/dashboard/calendars");
	});

	test("returns the calendar for the owner", async () => {
		pb.seed("calendars", [{ id: "c1", owner: "user-1", name: "Main", publicId: "main" }]);
		const calendar = await getCalendarById("c1");
		expect((calendar as PBRecord).name).toBe("Main");
	});
});

describe("getMyDynamicURLS", () => {
	test("resets expired 'set' overrides to never", async () => {
		const past = new Date(Date.now() - 60_000).toISOString();
		pb.seed("dynamic_url", [
			{
				id: "url-1",
				owner: "user-1",
				overrideExpireInStr: "set",
				overrideExpiresIn: past,
				enableOverrideRedirect: true,
				overrideRedirectTo: "https://old.example/",
				refs: []
			},
			{
				id: "url-2",
				owner: "user-1",
				overrideExpireInStr: "never",
				overrideExpiresIn: "",
				enableOverrideRedirect: false,
				refs: []
			}
		]);

		const urls = await getMyDynamicURLS();
		expect(urls).toHaveLength(2);

		const reset = urls.find((u: PBRecord) => u["id"] === "url-1");
		expect(reset!.overrideExpireInStr).toBe("never");
		expect(reset!.enableOverrideRedirect).toBe(false);

		const untouched = urls.find((u: PBRecord) => u["id"] === "url-2");
		expect(untouched!.overrideExpireInStr).toBe("never");
		expect(untouched!.enableOverrideRedirect).toBe(false);
	});

	test("does not touch future or non-set overrides", async () => {
		const future = new Date(Date.now() + 60_000).toISOString();
		pb.seed("dynamic_url", [
			{
				id: "url-1",
				owner: "user-1",
				overrideExpireInStr: "set",
				overrideExpiresIn: future,
				enableOverrideRedirect: true,
				refs: []
			}
		]);

		const urls = await getMyDynamicURLS();
		const kept = urls.find((u: PBRecord) => u["id"] === "url-1");
		expect(kept!.overrideExpireInStr).toBe("set");
		expect(kept!.enableOverrideRedirect).toBe(true);
	});
});
