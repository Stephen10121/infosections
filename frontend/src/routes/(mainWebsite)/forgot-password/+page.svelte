<script lang="ts">
	import AuthInput from "@/landingPage/authComponents/AuthInput.svelte";
	import AuthShell from "@/landingPage/authComponents/AuthShell.svelte";
	import { forgotPasswordAction } from "./forgotPassword.remote";
	import { LogIn } from "@lucide/svelte";
	import { toast } from "svelte-sonner";

	let loading = $state(false);
	let passwordResetEmailSent = $state(false);
</script>

<svelte:head>
	<title>Forgot Password | InfoSections</title>
</svelte:head>

<AuthShell
	title={passwordResetEmailSent ? "Success" : "Reset Password"}
	sub={passwordResetEmailSent
		? "Check your email containing directions to reset your password."
		: "We will send you a link to reset your password."}
>
	{#if !passwordResetEmailSent}
		<form
			class="space-y-4"
			{...forgotPasswordAction.enhance(async (form) => {
				loading = true;
				try {
					if (await form.submit()) {
						form.element.reset();

						loading = false;
						passwordResetEmailSent = true;
					} else {
						loading = false;
					}
				} catch (error) {
					loading = false;
					toast.error("Oh no! Something went wrong");
				}
			})}
		>
			<AuthInput
				label="EMAIL"
				id="email"
				{...forgotPasswordAction.fields.email.as("email")}
				placeholder="you@organization.com"
				error={[]}
			/>

			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 bg-primary text-primary-foreground font-mono text-[11px] tracking-widest hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
				style="font-family: 'JetBrains Mono', monospace"
			>
				{#if loading}
					<span
						class="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
					></span>
				{:else}
					<LogIn size={13} /> SEND
				{/if}
			</button>
		</form>
	{:else}
		<a
			href="/"
			class="w-full py-2.5 bg-primary text-primary-foreground font-mono text-[11px] tracking-widest hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
			style="font-family: 'JetBrains Mono', monospace"
		>
			<LogIn size={13} /> Go Home
		</a>
	{/if}
	<div class="mt-6 pt-5 border-t border-border text-center">
		<p class="text-xs text-muted-foreground" style="font-family: Inter, sans-serif">
			No account?{" "}
			<a
				href="signup"
				class="text-primary font-medium hover:opacity-80 transition-opacity cursor-pointer"
			>
				Create one free
			</a>
		</p>
	</div>
</AuthShell>
