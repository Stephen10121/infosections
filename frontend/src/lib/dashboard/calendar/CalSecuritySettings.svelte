<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import SettingRow from "@/components/SettingRow.svelte";
	import Toggle from "@/components/Toggle.svelte";
	import { motion } from "@humanspeak/svelte-motion";
	import FormInput from "@/components/FormInput.svelte";
	import { Lock, Unlock } from "@lucide/svelte";
	import Mono from "@/components/Mono.svelte";
	import FormTextarea from "@/components/FormTextarea.svelte";

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

<input
	{...updateCalendarForm.fields.enablePassword.as("checkbox")}
	class="sr-only"
	bind:checked={enablePasswordBindable}
	type="checkbox"
/>
<FieldLabel>Access Control</FieldLabel>
<div class="mt-2">
	<SettingRow label="Password protection" sub="Require a password to view this calendar">
		<Toggle bind:on={enablePasswordBindable} />
	</SettingRow>
</div>

{#if enablePasswordBindable}
	<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} class="space-y-3">
		<FieldLabel>Password</FieldLabel>
		<div class="flex gap-2 items-center">
			<div class="flex-1">
				{#if newPasswordBindable.length > 0}
					<input {...updateCalendarForm.fields.newPassword.as("hidden", newPasswordBindable)} />
				{/if}
				<FormInput
					type="password"
					bind:value={newPasswordBindable}
					placeholder="Set a password..."
				/>
			</div>
			<div class="text-primary">
				<Lock size={16} />
			</div>
		</div>
		<Mono class="text-[10px] text-muted-foreground block">
			Visitors will be prompted to enter this password before viewing.
		</Mono>
	</motion.div>
	<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} class="space-y-3">
		<FieldLabel>Password Screen Message</FieldLabel>
		<div class="flex gap-2 items-center">
			<div class="flex-1">
				{#if passwordScreenMessageBindable.length > 0}
					<input
						{...updateCalendarForm.fields.passwordScreenMessage.as(
							"hidden",
							passwordScreenMessageBindable
						)}
					/>
				{/if}
				<FormTextarea
					bind:value={passwordScreenMessageBindable}
					placeholder="Set a password screen message..."
				/>
			</div>
		</div>
	</motion.div>
{:else}
	<div class="flex items-center gap-3 p-3 bg-muted/30 border border-border/40">
		<Unlock size={14} class="text-muted-foreground shrink-0" />
		<Mono class="text-[10px] text-muted-foreground"
			>This calendar is publicly accessible — no password required.</Mono
		>
	</div>
{/if}
