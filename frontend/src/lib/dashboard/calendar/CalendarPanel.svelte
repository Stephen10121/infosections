<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import { getMyCalendars } from "../../../routes/(mainWebsite)/dashboard/backend.remote";
	import { AnimatePresence, motion } from "@humanspeak/svelte-motion";
	import CalSecuritySettings from "./CalSecuritySettings.svelte";
	import CalDisplaySettings from "./CalDisplaySettings.svelte";
	import CalFilterSettings from "./CalFilterSettings.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import * as Dialog from "@/components/ui/dialog/index";
	import CalGeneralInfo from "./CalGeneralInfo.svelte";
	import { Button } from "@/components/ui/button";
	import CopyButton from "@/CopyButton.svelte";
	import { clearFileInput, cn } from "@/utils";
	import Mono from "@/components/Mono.svelte";
	import CalAvatar from "./CalAvatar.svelte";
	import { toast } from "svelte-sonner";
	import { X } from "@lucide/svelte";

	type Tabs = "basic" | "display" | "filters" | "security" | "share";

	let {
		calendarID,
		open = $bindable(),
		pb_url
	}: {
		calendarID: string | undefined;
		open: boolean;
		pb_url: string;
	} = $props();

	const tabs: Tabs[] = ["basic", "display", "filters", "security", "share"];

	let tab: Tabs = $state("basic");

	let calendar = $derived((await getMyCalendars()).filter((cal) => cal.id === calendarID)[0]!);

	let unsavedChangesDialogShow = $state(false);
	function close() {
		const saveRequired =
			avatarChanged ||
			generalInfoChanged ||
			displaySettingsChanged ||
			filterSettingsChanged ||
			securitySettingsChanged;

		if (saveRequired) {
			unsavedChangesDialogShow = true;
			return;
		}

		actualClose();
	}

	function actualClose() {
		tab = "basic";

		if (uploadNewAvatar) {
			clearFileInput(document.getElementById("imageUploaderCalendar"));
			uploadNewAvatar = null;
			avatarChanged = false;
		}
		avatarChanged = false;
		generalInfoChanged = false;
		displaySettingsChanged = false;
		filterSettingsChanged = false;
		securitySettingsChanged = false;

		saveChangesToast = false;
		open = false;
		unsavedChangesDialogShow = false;
	}

	let uploadNewAvatar: File | null = $state(null);
	let saveChangesToast: boolean = $state(false);

	let previewURLPath = $derived(calendar.publicId);

	let avatarChanged = $state(false);
	let generalInfoChanged = $state(false);
	let filterSettingsChanged = $state(false);
	let displaySettingsChanged = $state(false);
	let securitySettingsChanged = $state(false);

	// This effect checks if any configurations have changed. If so, the saveRequired state will be set to true.
	$effect(() => {
		const saveRequired =
			avatarChanged ||
			generalInfoChanged ||
			displaySettingsChanged ||
			filterSettingsChanged ||
			securitySettingsChanged;

		if (saveRequired) {
			saveChangesToast = true;
			// if (saveChangesToast === null) {
			// 	saveChangesToast = toast("Save?", {
			// 		description: "You have some unsaved changes.",
			// 		dismissable: false,
			// 		duration: Number.POSITIVE_INFINITY,
			// 		action: {
			// 			label: "Save Changes",
			// 			onClick: () => {
			// 				const formSubmitButton = document.getElementById(
			// 					"updateCalendarButton1"
			// 				) as HTMLButtonElement | null;
			// 				if (formSubmitButton) {
			// 					formSubmitButton.click();
			// 				}
			// 			}
			// 		}
			// 	});
			// }
		} else {
			saveChangesToast = false;
			// if (saveChangesToast !== null) {
			// 	toast.dismiss(saveChangesToast);
			// }
			// saveChangesToast = null;
		}
	});

	$effect(() => {
		if (open) {
			getMyCalendars().refresh();
		}
	});

	function saveChanges() {
		const formSubmitButton = document.getElementById(
			"updateCalendarButton1"
		) as HTMLButtonElement | null;
		if (formSubmitButton) {
			formSubmitButton.click();
		}
	}
</script>

<AnimatePresence>
	{#if open && calendar}
		<motion.div
			key="calendar-backdrop"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			class="absolute inset-0 top-0 left-0 w-full h-full z-30 bg-foreground/10 backdrop-blur-[2px]"
			onclick={close}
		/>
		<motion.div
			key="calendar-panel"
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
			class="fixed top-12 right-0 bottom-0 w-120 max-w-full bg-background border-l border-border z-40 flex flex-col"
			style="box-shadow: -24px 0 48px rgba(0,0,0,0.08)"
		>
			<div
				class="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 shrink-0"
			>
				<div class="flex items-center gap-2.5">
					<Mono class="text-[9px] px-1.5 py-0.5 font-semibold bg-primary/15 text-primary">
						CALENDAR
					</Mono>
					<span
						class="text-sm font-semibold text-foreground"
						style="font-family: Inter, sans-serif"
					>
						{calendar.name}
					</span>
				</div>
				<button
					onclick={close}
					class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
				>
					<X size={16} />
				</button>
			</div>

			<!-- <div class="flex border-b border-border shrink-0">
            <StatChip label="VIEWS" value={item!.stats.views.toLocaleString()} icon={Eye} />
            <StatChip label="EVENTS" value={item!.stats.events} icon={Calendar} />
            <StatChip label="EMBEDS" value={item!.stats.embeds} icon={Code} />
        </div> -->

			<div class="flex border-b border-border shrink-0 overflow-x-auto">
				{#each tabs as t (t)}
					<button
						onclick={() => (tab = t)}
						class={cn(
							"px-4 py-2.5 font-mono text-[10px] tracking-widest transition-colors whitespace-nowrap cursor-pointer border-b-2",
							tab === t
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground"
						)}
					>
						{t.toUpperCase()}
					</button>
				{/each}
			</div>

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
				class="flex-1 overflow-y-auto"
				enctype="multipart/form-data"
			>
				{#if calendar.id.length > 0}
					<input {...updateCalendarForm.fields.id.as("hidden", calendar.id)} />
				{/if}

				<!-- Basic -->
				<div class="p-5 space-y-5 {tab === 'basic' ? 'block' : 'hidden'}">
					<CalAvatar
						bind:changed={avatarChanged}
						bind:uploadNewAvatar
						avatarLink={calendar.logo
							? `${pb_url}/api/files/${calendar.collectionId}/${calendar.id}/${calendar.logo}`
							: ""}
					/>

					<CalGeneralInfo
						bind:changed={generalInfoChanged}
						calPublicId={calendar.publicId}
						calendarName={calendar.name}
						calendarDescription={calendar.description}
						bind:newUrlPath={previewURLPath}
					/>

					{#if previewURLPath}
						<div class="p-3 bg-muted/40 border border-border/40">
							<FieldLabel>Preview URL</FieldLabel>
							<Mono class="text-[10px] text-primary mt-1 block break-all"
								>https://infosections.com/cal/{previewURLPath}</Mono
							>
						</div>
					{/if}
				</div>

				<!-- Display -->
				<div class="p-5 space-y-6 {tab === 'display' ? 'block' : 'hidden'}">
					<CalDisplaySettings
						displaySettings={$state.snapshot(calendar.displaySettings)}
						bind:changed={displaySettingsChanged}
					/>
				</div>

				<!-- Filters -->
				<div class="p-5 space-y-6 {tab === 'filters' ? 'block' : 'hidden'}">
					<CalFilterSettings
						filters={$state.snapshot(calendar.filters)}
						bind:changed={filterSettingsChanged}
					/>
				</div>

				<!-- Security -->
				<div class="p-5 space-y-6 {tab === 'security' ? 'block' : 'hidden'}">
					<CalSecuritySettings
						bind:changed={securitySettingsChanged}
						enablePassword={calendar.passwordEnabled}
						newPassword=""
						passwordScreenMessage={calendar.passwordScreenMessage}
					/>
				</div>

				<!-- Share -->
				<div class="p-5 space-y-5 {tab === 'share' ? 'block' : 'hidden'}">
					<!-- <div>
                    <FieldLabel>Statistics</FieldLabel>
                    <div class="flex mt-3 gap-0">
                    <StatChip label="TOTAL VIEWS" value={item!.stats.views.toLocaleString()} icon={Eye} />
                    <StatChip label="EVENTS" value={item!.stats.events} icon={Calendar} />
                    <StatChip label="EMBEDS" value={item!.stats.embeds} icon={Code} />
                    </div>
                </div> -->

					<div>
						<FieldLabel>Share URL</FieldLabel>
						<div class="flex gap-2 mt-2">
							<div class="flex-1 border border-border px-3 py-2 bg-muted/20 overflow-hidden">
								<Mono class="text-[10px] text-foreground break-all"
									>https://infosections.com/cal/{previewURLPath}</Mono
								>
							</div>
							<CopyButton text="https://infosections.com/cal/{previewURLPath}" />
						</div>
					</div>
				</div>
				<Button type="submit" id="updateCalendarButton1" class="sr-only">Update Calendar</Button>
			</form>

			<div class="flex items-center gap-2 px-5 py-3.5 border-t border-border shrink-0 bg-card/40">
				<button
					disabled={!saveChangesToast}
					onclick={saveChanges}
					type="button"
					class="font-mono text-[10px] tracking-widest px-5 py-2.5 transition-colors cursor-pointer bg-primary text-primary-foreground hover:opacity-90 {!saveChangesToast
						? 'opacity-25'
						: ''}"
				>
					SAVE CHANGES
				</button>
				<button
					type="button"
					onclick={close}
					class="font-mono text-[10px] tracking-widest px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
				>
					CANCEL
				</button>
				<div class="flex-1"></div>
				<Mono class="text-[9px] text-muted-foreground">created {calendar.created}</Mono>
			</div>
		</motion.div>
	{/if}
</AnimatePresence>

<Dialog.Root bind:open={unsavedChangesDialogShow}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>You have unsaved changes!</Dialog.Title>
			<Dialog.Description>
				<Mono class="text-xs text-muted-foreground">
					This action cannot be undone. This will permanently delete any changes you made to the
					calendar.
				</Mono>
			</Dialog.Description>
			<Dialog.Footer>
				<Button variant="destructive" onclick={actualClose}>I'm sure</Button>
				<Button
					variant="default"
					onclick={() => {
						unsavedChangesDialogShow = false;
						saveChanges();
						setTimeout(() => {
							close();
						}, 500);
					}}>Save Changes</Button
				>
			</Dialog.Footer>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
