<script lang="ts">
	import GoogleButton from "@/landingPage/authComponents/GoogleButton.svelte";
	import AuthDivider from "@/landingPage/authComponents/AuthDivider.svelte";
	import AuthInput from "@/landingPage/authComponents/AuthInput.svelte";
	import AuthShell from "@/landingPage/authComponents/AuthShell.svelte";
	import ToSNotice from "@/landingPage/authComponents/ToSNotice.svelte";
	import { googleLoginSignup } from "../signup/signup.remote";
	import { emailPasswordLogin } from "./login.remote";
	import Mono from "@/components/Mono.svelte";
	import { LogIn } from "@lucide/svelte";
	import { toast } from "svelte-sonner";

	let loading = $state(false);
</script>

<svelte:head>
	<title>Login | InfoSections</title>
</svelte:head>

<AuthShell title="Welcome back" sub="Sign in to your InfoSections account">
	<form {...googleLoginSignup}>
		<input {...googleLoginSignup.fields.id.as("hidden", "google_login")} />
		<GoogleButton label="Continue with Google" />
		{#each googleLoginSignup.fields.id.issues() as issue (`anIssueforoathGoogleLoginconfirm${issue.message}`)}
			<Mono class="text-[10px] text-destructive mt-1 block">{issue.message}</Mono>
		{/each}
	</form>
	<AuthDivider />
	<form
		class="space-y-4"
		{...emailPasswordLogin.enhance(async (form) => {
			loading = true;
			try {
				if (await form.submit()) {
					form.element.reset();

					loading = false;
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
			placeholder="you@organization.com"
			error={emailPasswordLogin.fields.email.issues()}
			{...emailPasswordLogin.fields.email.as("email")}
		/>
		<AuthInput
			label="PASSWORD"
			id="password"
			placeholder="••••••••"
			error={emailPasswordLogin.fields.password.issues()}
			{...emailPasswordLogin.fields.password.as("password")}
		/>

		<div class="flex items-center justify-end">
			<a
				href="/"
				class="font-mono text-[10px] text-primary hover:opacity-80 transition-opacity"
				style="font-family: 'JetBrains Mono', monospace"
			>
				Forgot password?
			</a>
		</div>

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
				<LogIn size={13} /> SIGN IN
			{/if}
		</button>
	</form>

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

	<div class="mt-5">
		<ToSNotice />
	</div>
</AuthShell>
