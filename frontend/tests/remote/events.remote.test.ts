import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { setRequestEvent } from "../helpers/mock-app";
import { FakePB, type PBRecord } from "../helpers/fake-pb";

// Importing helpers/mock-app registers the $app/server + $app/environment mocks.
// The remote modules must be imported AFTER that with a dynamic import, because
// bun's mock.module only applies to modules loaded after registration.
const remote = await import("../../src/routes/(mainWebsite)/dashboard/events.remote.ts");
const {
	getAllUserEvents,
	getMyEventResourcesPrivate,
	getMyEventTagsPrivate,
	updateSpecificUserEvents
} = remote;

let pb: FakePB;
let originalFetch: typeof globalThis.fetch;

function logIn(user: PBRecord = { id: "user-1", customerId: "cus_123" }) {
	setRequestEvent({
		locals: { pb, user },
		url: new URL("http://localhost:5173/dashboard"),
		cookies: new Map()
	});
}

beforeEach(() => {
	pb = new FakePB();
	originalFetch = globalThis.fetch;
	logIn();
});

afterEach(() => {
	setRequestEvent(undefined);
	globalThis.fetch = originalFetch;
});

describe("getAllUserEvents", () => {
	test("returns an empty list when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		expect(await getAllUserEvents()).toEqual([]);
	});

	test("returns the seeded events for a logged-in user", async () => {
		pb.seed("events", [
			{ id: "evt-1", owner: "user-1", name: "Service" },
			{ id: "evt-2", owner: "user-1", name: "Rehearsal" }
		]);
		const events = await getAllUserEvents();
		expect(events.map((e: PBRecord) => e.name).sort()).toEqual(["Rehearsal", "Service"]);
	});

	test("does not throw when pocketbase errors", async () => {
		// An unseeded collection makes pocketbase throw; the handler must swallow it.
		expect(await getAllUserEvents()).toEqual([]);
	});
});

describe("updateSpecificUserEvents", () => {
	test("returns an error when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		expect(await updateSpecificUserEvents()).toEqual({ error: true, msg: "No User." });
	});

	test("returns Successful sync when the backend accepts", async () => {
		globalThis.fetch = (async () =>
			({ ok: true }) as Response) as unknown as typeof globalThis.fetch;
		expect(await updateSpecificUserEvents()).toEqual({ error: false, msg: "Successful sync" });
	});

	test("propagates a network failure (no try/catch around fetch in source)", async () => {
		globalThis.fetch = (async () => {
			throw new Error("connection refused");
		}) as unknown as typeof globalThis.fetch;
		// NOTE: the source awaits `fetch(...)` without a try/catch, so a network
		// failure rejects the command. Test documents the current behaviour.
		expect(updateSpecificUserEvents()).rejects.toThrow("connection refused");
	});
});

describe("getMyEventTagsPrivate", () => {
	test("returns seeded tags for the user", async () => {
		pb.seed("tags", [
			{ id: "tag-1", owner: "user-1", name: "Youth", color: "#ff0000" },
			{ id: "tag-2", owner: "user-1", name: "Worship", color: "#00ff00" }
		]);
		const tags = await getMyEventTagsPrivate();
		expect(tags.map((t: PBRecord) => t.name).sort()).toEqual(["Worship", "Youth"]);
	});
});

describe("getMyEventResourcesPrivate", () => {
	test("returns seeded resources for the user", async () => {
		pb.seed("resources", [
			{ id: "res-1", owner: "user-1", name: "Main Auditorium", kind: "Room", quantity: 1 }
		]);
		const resources = await getMyEventResourcesPrivate();
		expect(resources[0]?.name).toBe("Main Auditorium");
	});

	test("returns an empty list when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		expect(await getMyEventResourcesPrivate()).toEqual([]);
	});
});
