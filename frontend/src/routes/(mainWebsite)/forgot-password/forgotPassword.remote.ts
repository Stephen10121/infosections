import { EmailSchema } from "@/valibotSchemaHelpers";
import { form, getRequestEvent } from "$app/server";
import { invalid } from "@sveltejs/kit";
import { config } from "dotenv";
import * as v from "valibot";

config();

const ForgotPasswordSchema = v.object({
	email: EmailSchema
});

export const forgotPasswordAction = form(ForgotPasswordSchema, async (newSignupData, issue) => {
	const { locals } = getRequestEvent();

	try {
		const success = await locals.pb.collection("users").requestPasswordReset(newSignupData.email);

		if (success) {
			return { ok: true };
		} else {
			return invalid(issue.email("Failed to send password reset email."));
		}
	} catch (err) {
		console.log("Password reset action error", err);

		return invalid(issue.email("Failed to send password reset email."));
	}
});
