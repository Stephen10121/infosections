<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import { Textarea } from "@/components/ui/textarea";
	import * as Card from "@/components/ui/card/index";
	import { Label } from "@/components/ui/label";
	import { Input } from "@/components/ui/input";

	let {
		changed = $bindable(),
		calPublicId,
		calendarName,
		calendarDescription
	}: {
		changed: boolean;
		calPublicId: string;
		calendarName: string;
		calendarDescription: string;
	} = $props();

	let calPublicIdBindable = $derived(calPublicId);
	let calendarNameBindable = $derived(calendarName);
	let calendarDescriptionBindable = $derived(calendarDescription);

	$effect(() => {
		const calPublicIdChanged = calPublicId !== calPublicIdBindable;
		const calendarNameChanged = calendarName !== calendarNameBindable;
		const calendarDescriptionChanged = calendarDescription !== calendarDescriptionBindable;

		changed = calPublicIdChanged || calendarNameChanged || calendarDescriptionChanged;
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>General Information</Card.Title>
		<Card.Description>Basic details about your calendar</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			{#if calPublicIdBindable.length > 0}
				<input {...updateCalendarForm.fields.publicId.as("hidden", calPublicIdBindable)} />
			{/if}
			<Label for="calendar-id">Calendar URL Path</Label>
			<Input id="calendar-id" bind:value={calPublicIdBindable} class="font-mono text-sm" />
			{#each updateCalendarForm.fields.publicId.issues() as issue}
				<p class="text-sm text-red-500">{issue.message}</p>
			{/each}
		</div>

		<div class="space-y-2">
			{#if calendarNameBindable.length > 0}
				<input {...updateCalendarForm.fields.name.as("hidden", calendarNameBindable)} />
			{/if}
			<Label for="calendar-name">Calendar Name</Label>
			<Input
				id="calendar-name"
				bind:value={calendarNameBindable}
				placeholder="Enter calendar name"
			/>
		</div>

		<div class="space-y-2">
			{#if calendarDescriptionBindable.length > 0}
				<input
					{...updateCalendarForm.fields.description.as("hidden", calendarDescriptionBindable)}
				/>
			{/if}
			<Label for="calendar-description">Description</Label>
			<Textarea
				bind:value={calendarDescriptionBindable}
				placeholder="Enter calendar description"
				rows={3}
				id="calendar-description"
			/>
		</div>
	</Card.Content>
</Card.Root>
