<script lang="ts">
	import { updateCalendarForm } from "../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import { getMyEventTagsPrivate } from "../../routes/(mainWebsite)/dashboard/events.remote";
	import type { CalendarFilters } from "@/cal.utils";
	import SettingRow from "./SettingRow.svelte";
	import Mono from "./Mono.svelte";

	let {
		filtersBindable = $bindable()
	}: {
		filtersBindable: CalendarFilters;
	} = $props();

	let myTags = $derived(await getMyEventTagsPrivate());
</script>

<div class="relative">
	<div class="w-full {filtersBindable.tagFilterType === 'block' ? 'hidden' : 'mt-0.5'}">
		<div class="space-y-2 mt-2">
			{#each myTags as tag (`allowATag${tag.id}`)}
				<div
					class="flex items-center gap-3 {!filtersBindable.enableTagFiltering ? 'opacity-55' : ''}"
				>
					<SettingRow label={tag.name} sub="Allow Tag">
						<input
							class="checkboxInput sr-only"
							disabled={!filtersBindable.enableTagFiltering}
							id="allowTag{tag.id}"
							{...updateCalendarForm.fields.filters.allowTags.as("checkbox", tag.id)}
							bind:group={filtersBindable.allowTags}
						/>
						<div class="checkbox">
							<div class="checkbox-switch"></div>
						</div>
					</SettingRow>
				</div>
			{/each}
		</div>
	</div>
	<div class="w-full {filtersBindable.tagFilterType === 'allow' ? 'hidden' : 'mt-0.5'}">
		<div class="space-y-2 mt-2">
			{#each myTags as tag (`blockATag${tag.id}`)}
				<div
					class="flex items-center gap-3 {!filtersBindable.enableTagFiltering ? 'opacity-55' : ''}"
				>
					<SettingRow label={tag.name} sub="Block Tag">
						<input
							class="checkboxInput sr-only"
							disabled={!filtersBindable.enableTagFiltering}
							id="blockTag{tag.id}"
							{...updateCalendarForm.fields.filters.blockTags.as("checkbox", tag.id)}
							bind:group={filtersBindable.blockTags}
						/>
						<div class="checkbox">
							<div class="checkbox-switch"></div>
						</div>
					</SettingRow>
				</div>
			{/each}
		</div>
	</div>
	{#if myTags.length === 0 && filtersBindable.enableTagFiltering}
		<Mono class="text-[10px] text-red-500 mt-1 mb-3 block">
			You currently have no tags imported from your integrations.
		</Mono>
	{/if}
</div>
