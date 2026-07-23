<script lang="ts">
	import CalSecuritySettings from "@/dashboard/calendar/CalSecuritySettings.svelte";
	import CalDisplaySettings from "@/dashboard/calendar/CalDisplaySettings.svelte";
	import CalFilterSettings from "@/dashboard/calendar/CalFilterSettings.svelte";
	import CalEventPreview from "@/dashboard/calendar/CalEventPreview.svelte";
	import CalQuickActions from "@/dashboard/calendar/CalQuickActions.svelte";
	import CalGeneralInfo from "@/dashboard/calendar/CalGeneralInfo.svelte";
	import CalStatistics from "@/dashboard/calendar/CalStatistics.svelte";
	import { updateCalendarForm } from "../calendarActions.remote.js";
	import CalAvatar from "@/dashboard/calendar/CalAvatar.svelte";
	import CalShare from "@/dashboard/calendar/CalShare.svelte";
	import { getCalendarById } from "../../backend.remote.js";
	import { Button } from "@/components/ui/button";
	import { Temporal } from "temporal-polyfill";
	import { clearFileInput } from "@/utils.js";
	import { ArrowLeft } from "@lucide/svelte";
	import { toast } from "svelte-sonner";
	import { onDestroy } from "svelte";

	let { data } = $props();

	let selectedCalendar = $derived(await getCalendarById(data.selectedCalendarId));

	let timeZone = $state(Temporal.Now.timeZoneId());
	let nowDate = $derived(Temporal.Now.zonedDateTimeISO(timeZone));
	let uploadNewAvatar: File | null = $state(null);
	let saveChangesToast: string | number | null = $state(null);

	let avatarChanged = $state(false);
	let generalInfoChanged = $state(false);
	let filterSettingsChanged = $state(false);
	let displaySettingsChanged = $state(false);
	let securitySettingsChanged = $state(false);

	// svelte-ignore state_referenced_locally
	let displaySettingsPreview = $state(selectedCalendar.displaySettings);

	// This effect checks if any configurations have changed. If so, the saveRequired state will be set to true.
	$effect(() => {
		const saveRequired =
			avatarChanged ||
			generalInfoChanged ||
			displaySettingsChanged ||
			filterSettingsChanged ||
			securitySettingsChanged;

		if (saveRequired) {
			if (saveChangesToast === null) {
				saveChangesToast = toast("Save?", {
					description: "You have some unsaved changes.",
					dismissable: false,
					duration: Number.POSITIVE_INFINITY,
					action: {
						label: "Save Changes",
						onClick: () => {
							const formSubmitButton = document.getElementById(
								"updateCalendarButton1"
							) as HTMLButtonElement | null;
							if (formSubmitButton) {
								formSubmitButton.click();
							}
						}
					}
				});
			}
		} else {
			if (saveChangesToast !== null) {
				toast.dismiss(saveChangesToast);
			}
			saveChangesToast = null;
		}
	});

	onDestroy(() => {
		if (saveChangesToast !== null) {
			toast.dismiss(saveChangesToast);
		}
		saveChangesToast = null;
	});
</script>

<svelte:head>
	<title>{selectedCalendar.name} | InfoSections</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6 isolate">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/dashboard/calendars">
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold text-foreground">{selectedCalendar.name} | Calendar Details</h1>
			<p class="text-muted-foreground mt-1">Manage your calendar settings and filters.</p>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<form
			{...updateCalendarForm.enhance(async (form) => {
				let savingChanges = toast.loading("Saving Changes.", {
					duration: Number.POSITIVE_INFINITY
				});
				try {
					await form.submit();
					toast.dismiss(savingChanges);

					if (!updateCalendarForm.fields.allIssues()) {
						form.element.reset();

						clearFileInput(document.getElementById("imageUploaderCalendar"));
						uploadNewAvatar = null;
						toast.success("Saved Changes");
					} else {
						toast.error("Something went wrong!");
					}
				} catch (err) {
					console.log(err);
					toast.dismiss(savingChanges);
					toast.error("An error occured.");
				}
			})}
			class="lg:col-span-2 space-y-6"
			enctype="multipart/form-data"
		>
			{#if selectedCalendar.id.length > 0}
				<input {...updateCalendarForm.fields.id.as("hidden", selectedCalendar.id)} />
			{/if}
			<Button type="submit" id="updateCalendarButton1" class="sr-only">Update Calendar</Button>
			<CalAvatar
				bind:changed={avatarChanged}
				bind:uploadNewAvatar
				avatarLink={selectedCalendar.logo
					? `${data.pb_url}/api/files/${selectedCalendar.collectionId}/${selectedCalendar.id}/${selectedCalendar.logo}`
					: ""}
			/>

			<CalGeneralInfo
				bind:changed={generalInfoChanged}
				calPublicId={selectedCalendar.publicId}
				calendarName={selectedCalendar.name}
				calendarDescription={selectedCalendar.description}
			/>

			<CalDisplaySettings
				displaySettings={selectedCalendar.displaySettings}
				bind:changed={displaySettingsChanged}
				bind:displaySettingsPreview
			/>

			<CalEventPreview {nowDate} displaySettings={displaySettingsPreview} />

			<CalFilterSettings filters={selectedCalendar.filters} bind:changed={filterSettingsChanged} />

			<CalSecuritySettings
				bind:changed={securitySettingsChanged}
				enablePassword={selectedCalendar.passwordEnabled}
				newPassword=""
				passwordScreenMessage={selectedCalendar.passwordScreenMessage}
			/>
		</form>

		<!-- This is the sticky side options section. -->
		<div class="space-y-6 stickySidebar h-fit">
			<CalShare calId={selectedCalendar.publicId} />

			<CalStatistics
				visits={selectedCalendar.visits}
				updated={selectedCalendar.updated}
				created={selectedCalendar.created}
				{timeZone}
			/>

			<CalQuickActions calId={selectedCalendar.id} />
		</div>
	</div>
</div>

<style>
	.stickySidebar {
		position: -webkit-sticky;
		position: sticky;
		top: 0;
	}
</style>
