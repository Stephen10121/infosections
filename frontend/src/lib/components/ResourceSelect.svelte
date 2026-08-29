<script lang="ts">
	import type { CalendarFilters } from "@/cal.utils";
	import { getMyEventResourcesPrivate } from "../../routes/(mainWebsite)/dashboard/events.remote";
	import { updateCalendarForm } from "../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import SettingRow from "./SettingRow.svelte";
	import Mono from "./Mono.svelte";

	let {
		filtersBindable = $bindable()
	}: {
		filtersBindable: CalendarFilters;
	} = $props();

	let myResources = $derived(await getMyEventResourcesPrivate());
</script>

<div class="relative">
	<div class="w-full {filtersBindable.resourceFilterType === 'block' ? 'hidden' : 'mt-0.5'}">
		<div class="space-y-2 mt-2">
			{#each myResources as resource (`allowAResource${resource.id}`)}
				<div
					class="flex items-center gap-3 w-full {!filtersBindable.enableResourceFiltering
						? 'opacity-55'
						: ''}"
				>
					<SettingRow
						label={resource.name}
						sub="Allow Resource{resource.path_name ? `: ${resource.path_name.trimEnd()}` : ''}"
					>
						<input
							class="checkboxInput sr-only"
							disabled={!filtersBindable.enableResourceFiltering}
							id="allowResource{resource.id}"
							{...updateCalendarForm.fields.filters.allowResources.as("checkbox", resource.id)}
							bind:group={filtersBindable.allowResources}
						/>
						<div class="checkbox">
							<div class="checkbox-switch"></div>
						</div>
					</SettingRow>
				</div>
			{/each}
		</div>
	</div>

	<div class="w-full {filtersBindable.resourceFilterType === 'allow' ? 'hidden' : 'mt-0.5'}">
		<div class="space-y-2 mt-2">
			{#each myResources as resource (`blockAResource${resource.id}`)}
				<div
					class="flex items-center gap-3 {!filtersBindable.enableResourceFiltering
						? 'opacity-55'
						: ''}"
				>
					<SettingRow
						label={resource.name}
						sub="Block Resource{resource.path_name ? `: ${resource.path_name.trimEnd()}` : ''}"
					>
						<input
							class="checkboxInput sr-only"
							disabled={!filtersBindable.enableResourceFiltering}
							id="blockResource{resource.id}"
							{...updateCalendarForm.fields.filters.blockResources.as("checkbox", resource.id)}
							bind:group={filtersBindable.blockResources}
						/>
						<div class="checkbox">
							<div class="checkbox-switch"></div>
						</div>
					</SettingRow>
				</div>
			{/each}
		</div>
	</div>

	{#if myResources.length === 0 && filtersBindable.enableResourceFiltering}
		<Mono class="text-[10px] text-red-500 mt-1 mb-3 block">
			You currently have no resources imported from your integrations.
		</Mono>
	{/if}
</div>
