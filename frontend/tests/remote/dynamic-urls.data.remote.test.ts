import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { SchemaValidationError, setRequestEvent } from "../helpers/mock-app";
import { FakePB, type PBRecord } from "../helpers/fake-pb";

// Importing helpers/mock-app registers the $app/server + $app/environment mocks.
// The remote modules must be imported AFTER that with a dynamic import, because
// bun's mock.module only applies to modules loaded after registration.
const remote = await import("../../src/routes/(mainWebsite)/dashboard/dynamic-urls/data.remote.ts");
const { createDynamicURLCommand, deleteDynamicURLCommand, updateDynamicURLCommand } = remote;

let pb: FakePB;

function logIn(user: PBRecord = { id: "user-1", accessLevel: "standard" }) {
	setRequestEvent({
		locals: { pb, user },
		url: new URL("http://localhost:5173/dashboard/dynamic-urls"),
		cookies: new Map()
	});
}

beforeEach(() => {
	pb = new FakePB();
	logIn();
});

afterEach(() => setRequestEvent(undefined));

describe("createDynamicURLCommand", () => {
	const input = () => ({
		id: "my-link",
		defaultRedirectTo: "https://example.com/this-week",
		timeZone: "America/New_York"
	});

	test("rejects a non-URL default redirect", async () => {
		const bad = { ...input(), defaultRedirectTo: "not a url" };
		expect(createDynamicURLCommand(bad)).rejects.toBeInstanceOf(SchemaValidationError);
	});

	test("returns No User when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		expect(await createDynamicURLCommand(input())).toEqual({ error: true, msg: "No User." });
	});

	test("rejects an id that is already in use", async () => {
		pb.seed("dynamic_url", [
			{ id: "my-link", owner: "user-1", defaultRedirectTo: "https://a.example/" }
		]);
		const result = await createDynamicURLCommand(input());
		expect(result.error).toBe(true);
		expect((result as { msg: string }).msg).toContain("already in use");
	});

	test("blocks free users who already have a dynamic url", async () => {
		logIn({ id: "user-1", accessLevel: "none" });
		pb.seed("users", [{ id: "user-1", accessLevel: "none" }]);
		pb.seed("dynamic_url", [
			{ id: "existing", owner: "user-1", defaultRedirectTo: "https://a.example/" }
		]);
		const result = await createDynamicURLCommand(input());
		expect(result).toEqual({
			error: true,
			msg: "Exceed the amount of dynamic URLs on the free plan."
		});
	});

	test("creates the dynamic url with an empty weeksheet", async () => {
		pb.seed("users", [{ id: "user-1", accessLevel: "standard" }]);
		const result = await createDynamicURLCommand(input());
		expect(result).toEqual({ error: false, msg: "Successfully created dynamic URL." });

		const created = await pb.collection("dynamic_url").getOne("my-link");
		expect(created.defaultRedirectTo).toBe("https://example.com/this-week");
		expect(created.weekSheet).toHaveLength(7);
		expect(created.overrideExpireInStr).toBe("never");
		expect(created.owner).toBe("user-1");
	});
});

describe("updateDynamicURLCommand", () => {
	const input = () => ({
		id: "my-link",
		defaultRedirectTo: "https://example.com/next-week",
		timeZone: "America/New_York",
		weekSheet: [[], [], [], [], [], [], []],
		enableWeekSheet: false,
		enableOverrideRedirect: false,
		overrideExpiresIn: "",
		disableURL: false,
		overrideRedirectTo: null
	});

	beforeEach(() => {
		pb.seed("dynamic_url", [
			{
				id: "my-link",
				owner: "user-1",
				defaultRedirectTo: "https://example.com/this-week",
				weekSheet: [[], [], [], [], [], [], []],
				enableWeekSheet: false,
				enableOverrideRedirect: false,
				overrideExpiresIn: "",
				disableURL: false,
				overrideRedirectTo: "",
				timeZone: "America/New_York",
				refs: [],
				overrideExpireInStr: "never"
			}
		]);
	});

	test("requires an override url when the override is enabled", async () => {
		const result = await updateDynamicURLCommand({
			...input(),
			enableOverrideRedirect: true,
			overrideRedirectTo: null
		});
		expect(result).toEqual({ error: true, msg: "No Override URL provided." });
	});

	test("returns Dynamic URL not found for unknown ids", async () => {
		const result = await updateDynamicURLCommand({ ...input(), id: "missing" });
		expect(result).toEqual({ error: true, msg: "Dynamic URL not found." });
	});

	test("rejects updates from users who do not own the url", async () => {
		logIn({ id: "other-user", accessLevel: "standard" });
		const result = await updateDynamicURLCommand(input());
		expect(result).toEqual({ error: true, msg: "Unauthorized." });
	});

	test("updates the dynamic url", async () => {
		const result = await updateDynamicURLCommand(input());
		expect(result).toEqual({ error: false, msg: "Successfully updated dynamic URL." });

		const updated = await pb.collection("dynamic_url").getOne("my-link");
		expect(updated.defaultRedirectTo).toBe("https://example.com/next-week");
	});

	test("saves the override url and marks it as set with an expiry", async () => {
		const expiry = new Date(Date.now() + 60_000).toISOString();
		const result = await updateDynamicURLCommand({
			...input(),
			enableOverrideRedirect: true,
			overrideRedirectTo: "https://override.example/",
			overrideExpiresIn: expiry
		});
		expect(result.error).toBe(false);

		const updated = await pb.collection("dynamic_url").getOne("my-link");
		expect(updated.overrideRedirectTo).toBe("https://override.example/");
		expect(updated.overrideExpireInStr).toBe("set");
		expect(updated.overrideExpiresIn).toBe(expiry);
	});
});

describe("deleteDynamicURLCommand", () => {
	test("returns No User when not logged in", async () => {
		setRequestEvent({ locals: { pb } });
		expect(await deleteDynamicURLCommand({ id: "my-link" })).toEqual({
			error: true,
			msg: "No User."
		});
	});

	test("returns Dynamic URL not found for unknown ids", async () => {
		const result = await deleteDynamicURLCommand({ id: "missing" });
		expect(result).toEqual({ error: true, msg: "Dynamic URL not found." });
	});

	test("rejects deletion from non-owners", async () => {
		logIn({ id: "other-user", accessLevel: "standard" });
		pb.seed("dynamic_url", [
			{ id: "my-link", owner: "user-1", defaultRedirectTo: "https://a.example/" }
		]);
		const result = await deleteDynamicURLCommand({ id: "my-link" });
		expect(result).toEqual({ error: true, msg: "Unauthorized." });
	});

	test("deletes the dynamic url for the owner", async () => {
		pb.seed("dynamic_url", [
			{ id: "my-link", owner: "user-1", defaultRedirectTo: "https://a.example/" }
		]);
		const result = await deleteDynamicURLCommand({ id: "my-link" });
		expect(result).toEqual({ error: false, msg: "Successfully deleted dynamic URL." });
		expect(await pb.collection("dynamic_url").getFullList()).toHaveLength(0);
	});
});
