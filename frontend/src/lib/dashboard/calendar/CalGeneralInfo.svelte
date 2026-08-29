<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import { Textarea } from "@/components/ui/textarea";
	import { Label } from "@/components/ui/label";
	import { Input } from "@/components/ui/input";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import Mono from "@/components/Mono.svelte";

	let {
		changed = $bindable(),
		calPublicId,
		calendarName,
		calendarDescription,
		newUrlPath = $bindable()
	}: {
		changed: boolean;
		calPublicId: string;
		calendarName: string;
		calendarDescription: string;
		newUrlPath: string;
	} = $props();

	let calPublicIdBindable = $derived(calPublicId);
	let calendarNameBindable = $derived(calendarName);
	let calendarDescriptionBindable = $derived(calendarDescription);

	$effect(() => {
		newUrlPath = calPublicIdBindable;
	});

	$effect(() => {
		const calPublicIdChanged = calPublicId !== calPublicIdBindable;
		const calendarNameChanged = calendarName !== calendarNameBindable;
		const calendarDescriptionChanged = calendarDescription !== calendarDescriptionBindable;

		changed = calPublicIdChanged || calendarNameChanged || calendarDescriptionChanged;
	});
</script>

<div class="space-y-2">
	{#if calPublicIdBindable.length > 0}
		<input {...updateCalendarForm.fields.publicId.as("hidden", calPublicIdBindable)} />
	{/if}
	<Label for="calendar-id">
		<FieldLabel>URL Path</FieldLabel>
	</Label>
	<input
		id="calendar-id"
		bind:value={calPublicIdBindable}
		class="w-full border border-border bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
		style="font-family: 'JetBrains Mono', monospace"
	/>
	{#each updateCalendarForm.fields.publicId.issues() as issue}
		<Mono class="text-xs text-red-500">{issue.message}</Mono>
	{/each}
</div>

<div class="space-y-2">
	{#if calendarNameBindable.length > 0}
		<input {...updateCalendarForm.fields.name.as("hidden", calendarNameBindable)} />
	{/if}
	<Label for="calendar-name"><FieldLabel>Name</FieldLabel></Label>
	<input
		id="calendar-name"
		bind:value={calendarNameBindable}
		placeholder="Enter calendar name"
		class="w-full border border-border bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
		style="font-family: 'JetBrains Mono', monospace"
	/>

	{#each updateCalendarForm.fields.name.issues() as issue}
		<Mono class="text-xs text-red-500">{issue.message}</Mono>
	{/each}
</div>

<div class="space-y-2">
	{#if calendarDescriptionBindable.length > 0}
		<input {...updateCalendarForm.fields.description.as("hidden", calendarDescriptionBindable)} />
	{/if}
	<Label for="calendar-description"><FieldLabel>Description</FieldLabel></Label>
	<textarea
		bind:value={calendarDescriptionBindable}
		placeholder="Enter calendar description"
		rows={3}
		id="calendar-description"
		class="w-full border border-border bg-transparent px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
		style="font-family: 'JetBrains Mono', monospace"></textarea>

	{#each updateCalendarForm.fields.description.issues() as issue}
		<Mono class="text-xs text-red-500">{issue.message}</Mono>
	{/each}
</div>
