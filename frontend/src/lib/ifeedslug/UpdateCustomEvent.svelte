<script lang="ts">
	import { updateCustomImageForm } from "../../routes/(mainWebsite)/dashboard/image-feeds/IFeedCustomImageActions.remote";
	import { clearFileInput, type CustomImageIFeedDBModel, type ImageFeedDBModel } from "@/utils";
	import Button from "@/components/ui/button/button.svelte";
	import { type RemoteFormField } from "@sveltejs/kit";
	import { Switch } from "@/components/ui/switch";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { Upload, X } from "@lucide/svelte";
	import { toast } from "svelte-sonner";

	let {
		customImages,
		apiServer,
		imageFeeds,
		currentFeedID,
		selectedEventIndex,
		close
	}: {
		customImages: CustomImageIFeedDBModel[];
		apiServer: string;
		imageFeeds: ImageFeedDBModel[];
		currentFeedID: string;
		selectedEventIndex: number;
		close: () => unknown;
	} = $props();

	let uploadNewEventPicture: File | null = $state(null);
	let uploadNewEventPictureLink = $derived(
		uploadNewEventPicture ? URL.createObjectURL(uploadNewEventPicture) : null
	);
	let currentCustomImage = $derived(customImages[selectedEventIndex] as CustomImageIFeedDBModel);

	let eventPictureLink = $derived(
		currentCustomImage.picture
			? `${apiServer}api/files/${currentCustomImage.collectionId}/${currentCustomImage.id}/${currentCustomImage.picture}`
			: ""
	);

	// svelte-ignore state_referenced_locally
	let linkText = $state(currentCustomImage.linkText);
	// svelte-ignore state_referenced_locally
	let registrationURL = $state(currentCustomImage.registrationURL);
	// svelte-ignore state_referenced_locally
	let showLink = $state(currentCustomImage.showLink);

	function handleRemoveEventPicture() {
		clearFileInput(document.getElementById("imageUploaderIFeed"));
		uploadNewEventPicture = null;
		eventPictureLink = "";
	}

	function handleEventPictureChange(
		event: Event & { currentTarget: EventTarget & HTMLInputElement }
	) {
		//@ts-ignore
		const files = event.target.files as File[];
		if (files.length === 0) return;
		if (!files[0]) return;

		uploadNewEventPicture = files[0];
		eventPictureLink = "";
	}
</script>

<form
	id="updateEventForm"
	{...updateCustomImageForm.enhance(async (form) => {
		const savingChangesToast = toast.loading("Saving changes!");
		try {
			await form.submit();
			toast.dismiss(savingChangesToast);
			if (!updateCustomImageForm.fields.allIssues()) {
				form.element.reset();
				clearFileInput(document.getElementById("imageUploaderIFeed"));
				uploadNewEventPicture = null;
				close();
				toast.success("Success.");
			}
		} catch (err) {
			console.log(err);
			toast.dismiss(savingChangesToast);
			toast.error("An error occured.");
		}
	})}
	enctype="multipart/form-data"
	class="grid flex-1 auto-rows-min gap-5 px-4 w-full overflow-y-auto"
>
	{#if currentCustomImage.id}
		<input {...updateCustomImageForm.fields.id.as("hidden", currentCustomImage.id)} />
	{/if}
	{#if currentFeedID}
		<input {...updateCustomImageForm.fields.currentIFeedId.as("hidden", currentFeedID)} />
	{/if}
	<input
		{...updateCustomImageForm.fields.eventPictureLink.as("text")}
		value={eventPictureLink}
		class="sr-only"
	/>

	<div class="flex items-start gap-4 flex-col">
		{#each updateCustomImageForm.fields.allIssues() as anIssue (`AformsubmitIssue${anIssue.message}`)}
			<p class="text-red-500">{anIssue.message}</p>
		{/each}
		<div class="relative w-full">
			{#if eventPictureLink.length > 0 || uploadNewEventPicture}
				<div class="relative group w-full">
					<img
						src={uploadNewEventPicture !== null ? uploadNewEventPictureLink : eventPictureLink}
						alt="Event Banner"
						class="aspect-video w-full rounded-lg object-cover border-2 border-border"
					/>
					<button
						onclick={handleRemoveEventPicture}
						class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<X class="h-4 w-4" />
					</button>
				</div>
			{:else}
				<div class="w-full aspect-video bg-ring/50 rounded-lg flex items-center justify-center">
					<p class="text-foreground">No Picture</p>
				</div>
			{/if}
		</div>
		<div class="flex-1 space-y-3">
			<div>
				<p class="text-sm text-foreground font-medium">Upload an image</p>
				<p class="text-sm text-muted-foreground mt-1">
					JPG, PNG or GIF. Max size 2MB. Recommended 960x540px.
				</p>
			</div>
			<div class="flex gap-2">
				<Button variant="outline" class="relative bg-transparent">
					<Upload class="h-4 w-4 mr-2" />
					Upload Image
					<input
						{...(
							updateCustomImageForm.fields.uploadNewEventPicture as unknown as RemoteFormField<File>
						).as("file")}
						id="imageUploaderIFeed"
						type="file"
						accept="image/*"
						onchange={handleEventPictureChange}
						class="absolute inset-0 opacity-0 cursor-pointer"
					/>
				</Button>
				{#if uploadNewEventPicture}
					<Button variant="outline" onclick={handleRemoveEventPicture} class="bg-transparent">
						Remove
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex items-center justify-between space-x-2">
		<input
			{...updateCustomImageForm.fields.showLink.as("checkbox")}
			checked={showLink}
			type="checkbox"
			class="sr-only"
		/>
		<Label for="showEvent" class="flex flex-col items-start space-y-1 cursor-pointer">
			<span class="font-medium">Show Link</span>
		</Label>
		<Switch name="eventShow" id="showEvent" bind:checked={showLink} />
	</div>

	{#if showLink}
		<div class="grid gap-2">
			<input
				{...updateCustomImageForm.fields.linkText.as("text")}
				value={linkText}
				class="sr-only"
			/>
			<Label for="name" class="text-end">Name*</Label>
			<Input name="eventName" id="name" bind:value={linkText} />
		</div>

		<div class="grid gap-2">
			<input
				{...updateCustomImageForm.fields.registrationURL.as("text")}
				value={registrationURL}
				class="sr-only"
			/>
			<Label for="registrationURL" class="text-end">Link URL*</Label>
			<Input
				name="eventRegistrationURL"
				id="registrationURL"
				bind:value={registrationURL}
				placeholder={`e.g. "https://event123.example.com/register"`}
			/>
		</div>
	{/if}

	{#each imageFeeds as imageFeed (`includeInAnImageFeed${imageFeed.id}`)}
		<div class="flex items-center gap-3 {imageFeed.id === currentFeedID ? 'sr-only' : ''}">
			<input
				id="includehere{imageFeed.id}"
				{...updateCustomImageForm.fields.included.as("checkbox", imageFeed.id)}
				checked={currentCustomImage.imageFeed.includes(imageFeed.id)}
			/>
			<Label for="includehere{imageFeed.id}">Include in "{imageFeed.name}" feed.</Label>
		</div>
	{/each}
</form>
