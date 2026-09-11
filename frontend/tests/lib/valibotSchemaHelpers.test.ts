import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { EmailSchema } from "@/valibotSchemaHelpers";

function issuesOf(fn: () => unknown) {
	try {
		fn();
		return null;
	} catch (err) {
		return (err as { issues?: unknown }).issues;
	}
}

describe("EmailSchema", () => {
	test("accepts well-formed emails", () => {
		expect(v.parse(EmailSchema, "user@example.com")).toBe("user@example.com");
		expect(v.parse(EmailSchema, "a.b+tag@sub.domain.co")).toBe("a.b+tag@sub.domain.co");
	});

	test("rejects empty input with the empty-email message", () => {
		const issues = issuesOf(() => v.parse(EmailSchema, ""));
		expect(issues).not.toBeNull();
		expect(JSON.stringify(issues)).toContain("Please enter your email.");
	});

	test("rejects whitespace-only input", () => {
		expect(() => v.parse(EmailSchema, "   ")).toThrow();
	});

	test("rejects malformed emails with the format message", () => {
		const issues = issuesOf(() => v.parse(EmailSchema, "not-an-email"));
		expect(issues).not.toBeNull();
		expect(JSON.stringify(issues)).toContain("The email is badly formatted.");
	});

	test("rejects emails longer than 30 characters", () => {
		const issues = issuesOf(() =>
			v.parse(EmailSchema, "a-very-long-address-over-thirty-chars@example.com")
		);
		expect(issues).not.toBeNull();
		expect(JSON.stringify(issues)).toContain("Your email is too long.");
	});
});
