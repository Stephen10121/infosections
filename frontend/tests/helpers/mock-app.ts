import { mock } from "bun:test";
import * as v from "valibot";

/**
 * Test double for the SvelteKit virtual module `$app/server`.
 *
 * At runtime this module is provided by SvelteKit / svelte-adapter-bun. Under
 * `bun test` it does not exist, so we register a `mock.module` replacement that
 * faithfully mimics the parts the remote functions rely on:
 *   - `getRequestEvent()`  -> returns the event supplied via `setRequestEvent()`
 *   - `command(schema, fn)`-> validates input with the valibot schema, then
 *                             executes `fn(parsed)` just like the real runtime
 *   - `form(schema, fn)`   -> same, but also passes an `issue` helper
 *   - `query(schema?, fn)` -> supports both `query(handler)` (server loaders)
 *                             and `query(schema, handler)` (RPC queries)
 *
 * Call `registerAppMocks()` from the top of every test file that imports a
 * `*.remote.ts` module. `$app/environment` and `svelte-sonner` are also stubbed
 * here so modules depending on them can be imported.
 */

export type TestRequestEvent = {
	locals: Record<string, any>;
	url?: URL;
	params?: Record<string, string>;
	cookies?: Map<string, string>;
	[key: string]: unknown;
};

let requestEvent: TestRequestEvent | undefined;
let registered = false;

/**
 * A validation failure produced by the mocked `command`/`form`/`query` wrappers.
 * The real runtime returns validation issues to the client; we surface them as
 * a typed error so tests can assert on them.
 */
export class SchemaValidationError extends Error {
	issues: unknown;

	constructor(issues: unknown) {
		super("Schema validation failed.");
		this.issues = issues;
	}
}

/** Set the request event `getRequestEvent()` will return for the current test. */
export function setRequestEvent(event: TestRequestEvent | undefined): void {
	requestEvent = event;
}

/** A minimal `issue` proxy matching the `invalid(issue.field("..."))` API. */
export function makeIssueProxy() {
	return new Proxy(
		{},
		{
			get: (_target, key: string) => (message: unknown) => ({
				field: key,
				message
			})
		}
	);
}

function parseOrThrow(schema: unknown, input: unknown): unknown {
	try {
		return v.parse(schema as never, input);
	} catch (err) {
		const issues = (err as { issues?: unknown }).issues;
		throw new SchemaValidationError(issues ?? err);
	}
}

/**
 * Mirrors SvelteKit's remote-query resource contract:
 *   const resource = myQuery(arg);  // resource is awaitable AND has .refresh()
 *   const data = await resource;    // resolves to the handler's result
 *   resource.refresh();             // invalidates the (non-existent here) cache
 * Calling `myQuery(arg)` returns a NEW resource per call.
 */
function makeQueryWrapper(run: (input?: unknown) => unknown) {
	const makeResource = (input?: unknown) => {
		// Run the handler in a `.then()` so synchronous throws (e.g. redirect() or
		// invalid() from @sveltejs/kit, which THROW) surface as rejected promises,
		// matching the async server-roundtrip the real remote functions perform.
		const resource = Promise.resolve().then(() => run(input)) as Promise<unknown> & {
			refresh: () => void;
		};
		resource.refresh = () => {};
		return resource;
	};
	const wrapper = (input?: unknown) => makeResource(input);
	wrapper.refresh = () => {};
	return wrapper;
}

/** Registers all bun module mocks. Called automatically on first import. */
export function registerAppMocks(): void {
	if (registered) return;
	registered = true;

	mock.module("$app/server", () => ({
		getRequestEvent: () => {
			if (requestEvent === undefined) {
				throw new Error("No request event set. Call setRequestEvent() in your test.");
			}
			return requestEvent;
		},
		command: (schemaOrHandler: unknown, maybeHandler?: (parsed: unknown) => unknown) => {
			// `command(async () => ...)` with no schema (e.g. updateSpecificUserEvents)
			if (typeof schemaOrHandler === "function") {
				return async () => (schemaOrHandler as () => unknown)();
			}
			return async (input: unknown) =>
				(maybeHandler as (parsed: unknown) => unknown)(parseOrThrow(schemaOrHandler, input));
		},
		form:
			(schema: unknown, handler: (parsed: unknown, issue: unknown) => unknown) =>
			async (input: unknown) =>
				handler(parseOrThrow(schema, input), makeIssueProxy()),
		query: (schemaOrHandler: unknown, maybeHandler?: (parsed: unknown) => unknown) => {
			if (typeof schemaOrHandler === "function") {
				const handler = schemaOrHandler as () => unknown;
				return makeQueryWrapper(() => handler());
			}
			const schema = schemaOrHandler;
			const handler = maybeHandler as (parsed: unknown) => unknown;
			return makeQueryWrapper((input) => handler(parseOrThrow(schema, input)));
		}
	}));

	mock.module("$app/environment", () => ({
		dev: true,
		building: false
	}));

	mock.module("svelte-sonner", () => ({
		toast: {
			loading: () => "test-toast-id",
			dismiss: () => {},
			error: () => {},
			success: () => {}
		}
	}));
}

/**
 * `redirect()` from @sveltejs/kit THROWS a Redirect object, so tests must catch
 * it to assert on the target location. Awaits `promise`, returns the thrown
 * Redirect, or fails the test if nothing is thrown.
 */
export async function catchRedirect(promise: Promise<unknown>): Promise<any> {
	try {
		await promise;
	} catch (err) {
		return err as Record<string, unknown>;
	}
	throw new Error("Expected a redirect to be thrown, but the call resolved normally.");
}

/** Auto-register so any test file that imports this helper works without boilerplate. */
registerAppMocks();
