<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import BlockAllowRadio from "@/components/BlockAllowRadio.svelte";
	import ResourceSelect from "@/components/ResourceSelect.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import SettingRow from "@/components/SettingRow.svelte";
	import TagSelect from "@/components/TagSelect.svelte";
	import type { CalendarFilters } from "@/cal.utils";
	import Toggle from "@/components/Toggle.svelte";
	import Mono from "@/components/Mono.svelte";

	let {
		filters,
		changed = $bindable()
	}: {
		filters: CalendarFilters;
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

<div class="grid grid-cols-1 gap-6">
	<div>
		<FieldLabel>Visibility</FieldLabel>
		<div class="mt-2">
			<input
				{...updateCalendarForm.fields.filters.onlyShowFeatured.as("checkbox")}
				class="sr-only"
				bind:checked={filtersBindable.onlyShowFeatured}
				type="checkbox"
			/>
			<SettingRow
				label="Featured events only"
				sub="Only show events marked as featured in Planning Center"
			>
				<Toggle bind:on={filtersBindable.onlyShowFeatured} />
			</SettingRow>
			<input
				{...updateCalendarForm.fields.filters.hideUnpublished.as("checkbox")}
				class="sr-only"
				bind:checked={filtersBindable.hideUnpublished}
				type="checkbox"
			/>
			<SettingRow
				label="Hide unpublished events"
				sub="Hide the events that are not visible in the church center."
			>
				<Toggle bind:on={filtersBindable.hideUnpublished} />
			</SettingRow>
			<input
				{...updateCalendarForm.fields.filters.enableTagFiltering.as("checkbox")}
				class="sr-only"
				bind:checked={filtersBindable.enableTagFiltering}
				type="checkbox"
			/>
			<SettingRow
				label="Enable Tag Filtering"
				sub="Most events contain information regarding the tags that are required. You can allow or
					block events based on its tag requirements."
			>
				<Toggle bind:on={filtersBindable.enableTagFiltering} />
			</SettingRow>
			<input
				{...updateCalendarForm.fields.filters.enableResourceFiltering.as("checkbox")}
				class="sr-only"
				bind:checked={filtersBindable.enableResourceFiltering}
				type="checkbox"
			/>
			<SettingRow
				label="Enable Resource Filtering"
				sub="Most events contain information regarding the resources that are required. You can allow
					or block events based on its resource requirements."
			>
				<Toggle bind:on={filtersBindable.enableResourceFiltering} />
			</SettingRow>
		</div>
	</div>

	<div>
		<FieldLabel>Tag Filter</FieldLabel>
		<Mono
			class="text-[10px] text-muted-foreground mt-1 mb-3 block {filtersBindable.enableTagFiltering
				? ''
				: 'opacity-25'}"
		>
			Only events matching at least one of these tags will appear.
		</Mono>
		<input
			{...updateCalendarForm.fields.filters.tagFilterType.as(
				"hidden",
				filtersBindable.tagFilterType
			)}
		/>
		<div class="mt-3">
			<BlockAllowRadio
				bind:value={filtersBindable.tagFilterType}
				disabled={!filtersBindable.enableTagFiltering}
			/>
		</div>
		<TagSelect bind:filtersBindable />
	</div>

	<div>
		<FieldLabel>Resource Filter</FieldLabel>
		<Mono
			class="text-[10px] text-muted-foreground mt-1 mb-3 block {filtersBindable.enableResourceFiltering
				? ''
				: 'opacity-25'}"
		>
			Restrict to events assigned to specific resources or rooms.
		</Mono>
		<input
			{...updateCalendarForm.fields.filters.resourceFilterType.as(
				"hidden",
				filtersBindable.resourceFilterType
			)}
		/>
		<div class="mt-3">
			<BlockAllowRadio
				bind:value={filtersBindable.resourceFilterType}
				disabled={!filtersBindable.enableResourceFiltering}
			/>
		</div>
		<ResourceSelect bind:filtersBindable />
	</div>
</div>
