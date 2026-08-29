<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import ViewModeRadio from "@/components/ViewModeRadio.svelte";
	import type { CalendarCustomizations } from "@/cal.utils";
	import SettingRow from "@/components/SettingRow.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import Toggle from "@/components/Toggle.svelte";
	import Mono from "@/components/Mono.svelte";

	let {
		displaySettings,
		changed = $bindable()
	}: {
		displaySettings: CalendarCustomizations;
		changed: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally
	let displaySettingsBindable = $state(displaySettings);
	$effect(() => {
		displaySettingsBindable = displaySettings;
	});

	$effect(() => {
		changed = JSON.stringify(displaySettingsBindable) !== JSON.stringify(displaySettings);
	});
</script>

<div class="grid grid-cols-1 gap-6">
	<div>
		<input
			{...updateCalendarForm.fields.displaySettings.viewType.as(
				"hidden",
				displaySettingsBindable.viewType
			)}
		/>
		<FieldLabel>Default View</FieldLabel>
		<div class="mt-3">
			<ViewModeRadio bind:value={displaySettingsBindable.viewType} />
		</div>
		<Mono class="text-[10px] text-muted-foreground mt-2 block">
			Controls how events are laid out by default. Users can switch views.
		</Mono>
	</div>

	<div>
		<FieldLabel>Display Options</FieldLabel>
		<div class="mt-2">
			<input
				{...updateCalendarForm.fields.displaySettings.showDescription.as("checkbox")}
				class="sr-only"
				bind:checked={displaySettingsBindable.showDescription}
				type="checkbox"
			/>
			<SettingRow label="Show event descriptions" sub="Display full description below event title">
				<Toggle bind:on={displaySettingsBindable.showDescription} />
			</SettingRow>
			<input
				{...updateCalendarForm.fields.displaySettings.useAMPM.as("checkbox")}
				class="sr-only"
				bind:checked={displaySettingsBindable.useAMPM}
				type="checkbox"
			/>
			<SettingRow label="12-hour (AM/PM) format" sub="Use 12-hour clock instead of 24-hour">
				<Toggle bind:on={displaySettingsBindable.useAMPM} />
			</SettingRow>
			<input
				{...updateCalendarForm.fields.displaySettings.showResources.as("checkbox")}
				class="sr-only"
				bind:checked={displaySettingsBindable.showResources}
				type="checkbox"
			/>
			<SettingRow label="Show resources" sub="Display assigned resources on each event">
				<Toggle bind:on={displaySettingsBindable.showResources} />
			</SettingRow>
			{#if displaySettingsBindable.showResources}
				<input
					{...updateCalendarForm.fields.displaySettings.showResourcePathname.as("checkbox")}
					class="sr-only"
					bind:checked={displaySettingsBindable.showResourcePathname}
					type="checkbox"
				/>
				<SettingRow label="Show Resource Pathname" sub="Display full resource paths">
					<Toggle bind:on={displaySettingsBindable.showResourcePathname} />
				</SettingRow>
			{/if}
			<input
				{...updateCalendarForm.fields.displaySettings.showRooms.as("checkbox")}
				class="sr-only"
				bind:checked={displaySettingsBindable.showRooms}
				type="checkbox"
			/>
			<SettingRow label="Show rooms" sub="Display room assignments when available">
				<Toggle bind:on={displaySettingsBindable.showRooms} />
			</SettingRow>
			<input
				{...updateCalendarForm.fields.displaySettings.showLocation.as("checkbox")}
				class="sr-only"
				bind:checked={displaySettingsBindable.showLocation}
				type="checkbox"
			/>
			<SettingRow label="Show location" sub="Display event location / venue name">
				<Toggle bind:on={displaySettingsBindable.showLocation} />
			</SettingRow>
			{#if displaySettingsBindable.showLocation}
				<input
					{...updateCalendarForm.fields.displaySettings.onlyShowLocationTitle.as("checkbox")}
					class="sr-only"
					bind:checked={displaySettingsBindable.onlyShowLocationTitle}
					type="checkbox"
				/>
				<SettingRow label="Only Show Location Title" sub="Hide detailed location information">
					<Toggle bind:on={displaySettingsBindable.onlyShowLocationTitle} />
				</SettingRow>
			{/if}
		</div>
	</div>
</div>
