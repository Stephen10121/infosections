<script lang="ts">
	import { createEmailPasswordSignup, googleLoginSignup } from "./signup.remote";
	import GoogleButton from "@/landingPage/authComponents/GoogleButton.svelte";
	import AuthDivider from "@/landingPage/authComponents/AuthDivider.svelte";
	import AuthInput from "@/landingPage/authComponents/AuthInput.svelte";
	import AuthShell from "@/landingPage/authComponents/AuthShell.svelte";
	import ToSNotice from "@/landingPage/authComponents/ToSNotice.svelte";
	import Mono from "@/components/Mono.svelte";
	import { UserPlus } from "@lucide/svelte";
	import { toast } from "svelte-sonner";

	let loading = $state(false);
</script>

<svelte:head>
	<title>Signup | InfoSections</title>
</svelte:head>

<AuthShell title="Create your account" sub="Start your free 14-day trial. No credit card required!">
	<form {...googleLoginSignup}>
		<input {...googleLoginSignup.fields.id.as("hidden", "google_login")} />
		<GoogleButton label="Sign up with Google" />
		{#each googleLoginSignup.fields.id.issues() as issue (`anIssueforoathGoogleLoginconfirm${issue.message}`)}
			<Mono class="text-[10px] text-destructive mt-1 block">{issue.message}</Mono>
		{/each}
	</form>
	<AuthDivider />
	<form
		class="space-y-4"
		{...createEmailPasswordSignup.enhance(async (form) => {
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
			{...createEmailPasswordSignup.fields.name.as("text")}
			label="FULL NAME"
			id="fullName"
			type="text"
			placeholder="Jane Smith"
			error={createEmailPasswordSignup.fields.name.issues()}
		/>
		<AuthInput
			{...createEmailPasswordSignup.fields.email.as("email")}
			label="EMAIL"
			id="email"
			type="email"
			placeholder="you@organization.com"
			error={createEmailPasswordSignup.fields.email.issues()}
		/>
		<AuthInput
			{...createEmailPasswordSignup.fields.password.as("password")}
			label="PASSWORD"
			id="password"
			type="password"
			placeholder="Min. 8 characters"
			error={createEmailPasswordSignup.fields.password.issues()}
		/>
		<AuthInput
			{...createEmailPasswordSignup.fields.passwordConfirm.as("password")}
			label="CONFIRM PASSWORD"
			id="confirmpassword"
			type="password"
			placeholder="Repeat your password"
			error={createEmailPasswordSignup.fields.passwordConfirm.issues()}
		/>

		<button
			type="submit"
			disabled={loading}
			class="w-full py-2.5 bg-primary text-primary-foreground font-mono text-[11px] tracking-widest hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-1"
			style="font-family: 'JetBrains Mono', monospace"
		>
			{#if loading}
				<span
					class="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
				></span>
			{:else}
				<UserPlus size={13} /> CREATE ACCOUNT
			{/if}
		</button>
	</form>

	<div class="mt-6 pt-5 border-t border-border text-center">
		<p class="text-xs text-muted-foreground" style="font-family: Inter, sans-serif">
			Already have an account?{" "}
			<a
				href="/login"
				class="text-primary font-medium hover:opacity-80 transition-opacity cursor-pointer"
			>
				Sign in
			</a>
		</p>
	</div>

	<div class="mt-5">
		<ToSNotice />
	</div>
</AuthShell>
