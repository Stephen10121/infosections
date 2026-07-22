<script lang="ts">
	import { updateEventListForm } from "../../../routes/(mainWebsite)/dashboard/event-lists/eventListActions.remote";
	import * as Card from "@/components/ui/card/index";
	import { Switch } from "@/components/ui/switch";
	import type { ImageFeedFilters } from "@/utils";
	import { Label } from "@/components/ui/label";

	let {
		filters,
		changed = $bindable()
	}: {
		filters: ImageFeedFilters;
		changed: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally
	let filtersBindable = $state(filters);
	$effect(() => {
		filtersBindable = filters;
	});

	$effect(() => {
		changed = JSON.stringify(filtersBindable) !== JSON.stringify(filters);
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Filter Settings</Card.Title>
		<Card.Description
			>Choose what kind of events you want to show in the list (Changes not reflected in EList
			preview!)</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-1 gap-6">
			<div class="flex items-center justify-between space-x-2">
				<Label for="onlyShowFeatured" class="flex flex-col items-start space-y-1 cursor-pointer">
					<span class="font-medium">Only Featured Events</span>
					<span class="text-sm text-muted-foreground"
						>Show only the events that are set to featured.</span
					>
				</Label>

				<input
					{...updateEventListForm.fields.filters.onlyShowFeatured.as("checkbox")}
					class="sr-only"
					bind:checked={filtersBindable.onlyShowFeatured}
					type="checkbox"
				/>
				<Switch id="onlyShowFeatured" bind:checked={filtersBindable.onlyShowFeatured} />
			</div>

			<div class="flex items-center justify-between space-x-2">
				<Label for="hideUnpublished" class="flex flex-col items-start space-y-1 cursor-pointer">
					<span class="font-medium">Hide Unpublished Events</span>
					<span class="text-sm text-muted-foreground"
						>Hide the events that are not visible in the church center.</span
					>
				</Label>

				<input
					{...updateEventListForm.fields.filters.hideUnpublished.as("checkbox")}
					class="sr-only"
					bind:checked={filtersBindable.hideUnpublished}
					type="checkbox"
				/>
				<Switch id="hideUnpublished" bind:checked={filtersBindable.hideUnpublished} />
			</div>

			<div class="flex items-center justify-between space-x-2">
				<Label for="hideRecurringEvents" class="flex flex-col items-start space-y-1 cursor-pointer">
					<span class="font-medium">Hide Recurring Events</span>
					<span class="text-sm text-muted-foreground"
						>Hide events that are recurring but show only the first instance of the event in the
						feed.</span
					>
				</Label>

				<input
					{...updateEventListForm.fields.filters.hideRecurringEvents.as("checkbox")}
					class="sr-only"
					bind:checked={filtersBindable.hideRecurringEvents}
					type="checkbox"
				/>
				<Switch id="hideRecurringEvents" bind:checked={filtersBindable.hideRecurringEvents} />
			</div>
		</div>
	</Card.Content>
</Card.Root>
