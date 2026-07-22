<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import { Textarea } from "@/components/ui/textarea";
	import * as Card from "@/components/ui/card/index";
	import { Switch } from "@/components/ui/switch";
	import { Label } from "@/components/ui/label";
	import { Input } from "@/components/ui/input";

	let {
		changed = $bindable(),
		enablePassword,
		newPassword,
		passwordScreenMessage
	}: {
		changed: boolean;
		enablePassword: boolean;
		newPassword: string;
		passwordScreenMessage: string;
	} = $props();

	let enablePasswordBindable = $derived(enablePassword);
	let newPasswordBindable = $derived(newPassword);
	let passwordScreenMessageBindable = $derived(passwordScreenMessage);

	$effect(() => {
		const enablePasswordChanged = enablePasswordBindable !== enablePassword;
		const newPasswordChanged = newPassword !== newPasswordBindable;
		const passwordScreenMessageChanged = passwordScreenMessage !== passwordScreenMessageBindable;

		changed =
			enablePasswordChanged ||
			(enablePassword && newPasswordChanged) ||
			(enablePassword && passwordScreenMessageChanged);
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Security Settings</Card.Title>
		<Card.Description>Control access to your calendar</Card.Description>
	</Card.Header>

	<Card.Content class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label for="password-protection" class="text-base">Password Protection</Label>
				<p class="text-sm text-muted-foreground">Require a password to access this calendar</p>
			</div>
			<input
				{...updateCalendarForm.fields.enablePassword.as("checkbox")}
				class="sr-only"
				bind:checked={enablePasswordBindable}
				type="checkbox"
			/>
			<Switch id="password-protection" bind:checked={enablePasswordBindable} />
		</div>

		{#if enablePasswordBindable}
			<div class="space-y-2 pt-2">
				{#if newPasswordBindable.length > 0}
					<input {...updateCalendarForm.fields.newPassword.as("hidden", newPasswordBindable)} />
				{/if}
				<Label for="password">Calendar Password</Label>
				<Input
					id="password"
					bind:value={newPasswordBindable}
					type="password"
					placeholder="Enter password"
				/>
			</div>
			<div class="space-y-2">
				{#if passwordScreenMessageBindable.length > 0}
					<input
						{...updateCalendarForm.fields.passwordScreenMessage.as(
							"hidden",
							passwordScreenMessageBindable
						)}
					/>
				{/if}
				<Label for="passwordScreenMessage">Password Screen Message</Label>
				<Textarea
					id="passwordScreenMessage"
					bind:value={passwordScreenMessageBindable}
					placeholder="Enter Password Screen Message"
					rows={3}
				/>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<style>
	input[type="checkbox"] {
		accent-color: #000000;
	}
</style>
