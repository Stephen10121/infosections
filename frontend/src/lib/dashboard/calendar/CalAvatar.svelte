<script lang="ts">
	import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
	import NoCalendarAvatar from "@/NoCalendarAvatar.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import { type RemoteFormField } from "@sveltejs/kit";
	import { Button } from "@/components/ui/button";
	import { Upload, X } from "@lucide/svelte";
	import { clearFileInput } from "@/utils";
	import Mono from "@/components/Mono.svelte";

	let {
		changed = $bindable(),
		avatarLink,
		uploadNewAvatar = $bindable()
	}: {
		changed: boolean;
		avatarLink: string;
		uploadNewAvatar: File | null;
	} = $props();

	let avatarLinkBindable = $derived(avatarLink);

	let uploadNewAvatarLink = $derived(uploadNewAvatar ? URL.createObjectURL(uploadNewAvatar) : null);

	function handleRemoveAvatar() {
		clearFileInput(document.getElementById("imageUploaderCalendar"));
		uploadNewAvatar = null;
		avatarLinkBindable = "";
	}

	function handleAvatarChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		//@ts-ignore
		const files = event.target.files as File[];
		if (files.length === 0) return;
		if (!files[0]) return;

		uploadNewAvatar = files[0];
		avatarLinkBindable = "";
	}

	$effect(() => {
		const avatarLinkChanged = avatarLinkBindable !== avatarLink;
		const uploadNewAvatarChanged = uploadNewAvatar !== null;

		changed = avatarLinkChanged || uploadNewAvatarChanged;
	});
</script>

<div>
	<FieldLabel>Upload an image to represent your calendar</FieldLabel>
	<Mono class="text-[10px] text-muted-foreground mt-0.5 mb-3 block">
		Shown on the public calendar page and share cards.
	</Mono>
	<div class="flex items-center gap-6 mt-2">
		<div class="relative">
			{#if avatarLinkBindable.length > 0 || uploadNewAvatar}
				{#if avatarLinkBindable.length > 0}
					<input {...updateCalendarForm.fields.avatarLink.as("hidden", avatarLinkBindable)} />
				{/if}

				<div class="relative group">
					<img
						src={uploadNewAvatar !== null ? uploadNewAvatarLink : avatarLink}
						alt="Calendar avatar"
						class="w-24 h-24 rounded-lg object-cover border-2 border-border"
					/>
					<button
						onclick={handleRemoveAvatar}
						class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			{:else}
				<div class="w-24 h-24">
					<NoCalendarAvatar />
				</div>
			{/if}
		</div>
		<div class="flex-1 space-y-3">
			<div class="flex gap-2">
				<Button variant="outline" class="relative bg-transparent">
					<Upload class="h-4 w-4 mr-2" />
					Upload Image
					<input
						{...(updateCalendarForm.fields.newAvatar as unknown as RemoteFormField<File>).as(
							"file"
						)}
						id="imageUploaderCalendar"
						type="file"
						accept="image/*"
						onchange={handleAvatarChange}
						class="absolute inset-0 opacity-0 cursor-pointer"
					/>
				</Button>
				{#if uploadNewAvatar}
					<Button variant="outline" onclick={handleRemoveAvatar} class="bg-transparent">
						Remove
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
