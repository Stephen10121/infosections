<script lang="ts">
	import EListDisplaySettings from "@/dashboard/eventList/EListDisplaySettings.svelte";
	import EListFilterSettings from "@/dashboard/eventList/EListFilterSettings.svelte";
	import EListQuickActions from "@/dashboard/eventList/EListQuickActions.svelte";
	import EListGeneralInfo from "@/dashboard/eventList/EListGeneralInfo.svelte";
	import EListStatistics from "@/dashboard/eventList/EListStatistics.svelte";
	import EListPreview from "@/dashboard/eventList/EListPreview.svelte";
	import { updateEventListForm } from "../eventListActions.remote.js";
	import EListAvatar from "@/dashboard/eventList/EListAvatar.svelte";
	import EListShare from "@/dashboard/eventList/EListShare.svelte";
	import { getEventListById } from "../../backend.remote.js";
	import { Button } from "@/components/ui/button";
	import { Temporal } from "temporal-polyfill";
	import { clearFileInput } from "@/utils.js";
	import { ArrowLeft } from "@lucide/svelte";
	import { toast } from "svelte-sonner";
	import { onDestroy } from "svelte";

	let { data } = $props();

	let selectedEventList = $derived(await getEventListById(data.selectedlistId));

	let timeZone = $state(Temporal.Now.timeZoneId());
	let uploadNewAvatar: File | null = $state(null);
	let saveChangesToast: string | number | null = $state(null);

	let avatarChanged = $state(false);
	let generalInfoChanged = $state(false);
	let filterSettingsChanged = $state(false);
	let displaySettingsChanged = $state(false);

	// svelte-ignore state_referenced_locally
	let displaySettingsPreview = $state(selectedEventList.displaySettings);

	// This effect checks if any configurations have changed. If so, the saveRequired state will be set to true.
	$effect(() => {
		const saveRequired =
			avatarChanged || generalInfoChanged || displaySettingsChanged || filterSettingsChanged;

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
								"updateEventListButton1"
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
	<title>{selectedEventList.name} | InfoSections</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6 isolate">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/dashboard/event-lists">
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold text-foreground">{selectedEventList.name} | List Details</h1>
			<p class="text-muted-foreground mt-1">Manage your event list settings and filters.</p>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<div class="lg:col-span-2 space-y-6">
			<form
				{...updateEventListForm.enhance(async ({ submit, form }) => {
					let savingChanges = toast.loading("Saving Changes.", {
						duration: Number.POSITIVE_INFINITY
					});
					try {
						await submit();
						form.reset();
						clearFileInput(document.getElementById("imageUploaderEventList"));
						uploadNewAvatar = null;
						toast.dismiss(savingChanges);

						toast.success("Saved Changes");
					} catch (err) {
						console.log(err);
						toast.dismiss(savingChanges);
						toast.error("An error occured.");
					}
				})}
				class="space-y-6"
				enctype="multipart/form-data"
			>
				<Button type="submit" id="updateEventListButton1" class="sr-only">Update Image Feed</Button>
				<EListAvatar
					bind:changed={avatarChanged}
					bind:uploadNewAvatar
					avatarLink={selectedEventList.logo
						? `${data.pb_url}/api/files/${selectedEventList.collectionId}/${selectedEventList.id}/${selectedEventList.logo}`
						: ""}
				/>

				<EListGeneralInfo
					bind:changed={generalInfoChanged}
					listId={selectedEventList.id}
					listName={selectedEventList.name}
					listDescription={selectedEventList.description}
				/>

				<EListDisplaySettings
					displaySettings={selectedEventList.displaySettings}
					bind:changed={displaySettingsChanged}
					bind:displaySettingsPreview
				/>

				<EListPreview displaySettings={displaySettingsPreview} listId={selectedEventList.id} />

				<EListFilterSettings
					filters={selectedEventList.filters}
					bind:changed={filterSettingsChanged}
				/>
			</form>
		</div>

		<!-- This is the sticky side options section. -->
		<div class="space-y-6 stickySidebar h-fit">
			<EListShare listId={selectedEventList.id} listName={selectedEventList.name} />

			<EListStatistics
				visits={selectedEventList.visits}
				updated={selectedEventList.updated}
				created={selectedEventList.created}
				{timeZone}
			/>

			<EListQuickActions listId={selectedEventList.id} />
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
