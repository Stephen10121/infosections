<script lang="ts">
    import { createCustomImageForm } from "../../routes/(mainWebsite)/dashboard/image-feeds/IFeedCustomImageActions.remote";
    import Spinner from "@/components/ui/spinner/spinner.svelte";
    import { Button } from "@/components/ui/button";
    import * as Dialog from "@/components/ui/dialog";
    import { invalidateAll } from "$app/navigation";
    import { Switch } from "@/components/ui/switch";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Upload, X } from "@lucide/svelte";
    import { clearFileInput } from "@/utils";
    import { toast } from "svelte-sonner";

    let { iFeedId, dialogOpen = $bindable() }: { iFeedId: string, dialogOpen: boolean } = $props();

    let linkText = $state("");
    let showLink = $state(false);
    let registrationURL = $state("");
    let uploadNewEventPicture: File | null = $state(null);
    let uploadNewEventPictureLink = $derived(uploadNewEventPicture ? URL.createObjectURL(uploadNewEventPicture) : null);
    let creatingForm = $state(false);

    function handleEventPictureChange(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
        //@ts-ignore
        const files = event.target.files as File[];
        if (files.length === 0) return;
        uploadNewEventPicture = files[0];
    }

    function handleRemoveEventPicture() {
        clearFileInput(document.getElementById("newCustomEventImageInput"))
        uploadNewEventPicture = null;
    }
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="sm:max-w-[500px] max-h-screen overflow-y-auto" style="max-height: calc(100vh - 50px);">
        <Dialog.Header>
            <Dialog.Title>Add Image</Dialog.Title>
            <Dialog.Description>Add an image to this feed.</Dialog.Description>
        </Dialog.Header>
        <form
            {...createCustomImageForm.enhance(async ({ submit, form }) => {
                creatingForm = true;
                try {
                    await submit();
                    creatingForm = false;
                    if (!createCustomImageForm.fields.allIssues()) {
                        form.reset();
                        clearFileInput(document.getElementById("newCustomEventImageInput"));
                        uploadNewEventPicture = null;
                        linkText = "";
                        registrationURL = "";
                        showLink = false;
                        dialogOpen = false;
                        toast.success("Successfully added the image.");
                    }
                } catch (err) {
                    console.log(err);
                    creatingForm = false;
                    toast.error("An error occured.");
                }
            })}
            class="space-y-4 py-4"
            enctype="multipart/form-data"
            id="createCustomImageForm"
        >
            {#if iFeedId}
                <input {...createCustomImageForm.fields.currentIFeed.as("hidden", iFeedId)} />
            {/if}
            <div class="space-y-2">
                <Label for="event-picture">Picture*</Label>
                {#if uploadNewEventPictureLink}
                    <div class="relative">
                        <img
                            src={uploadNewEventPictureLink}
                            alt="Event preview"
                            class="w-full aspect-video object-cover rounded-lg border-2 border-border"
                        />
                        <button
                            onclick={handleRemoveEventPicture}
                            class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>
                {/if}
                <div class="{uploadNewEventPictureLink ? "sr-only" : ""} border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Button variant="outline" class="relative bg-transparent" type="button">
                        <Upload class="h-4 w-4 mr-2" />
                        Upload Image
                        <input
                            {...createCustomImageForm.fields.picture.as("file")}
                            type="file"
                            accept="image/*"
                            onchange={handleEventPictureChange}
                            id="newCustomEventImageInput"
                            class="absolute inset-0 opacity-0 cursor-pointer"
                            required
                        />
                    </Button>
                    <p class="text-xs text-muted-foreground mt-2">PNG, JPG or GIF. Max 2MB</p>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <input {...createCustomImageForm.fields.showLink.as("checkbox")} checked={showLink} type="checkbox" class="sr-only" />
                <div class="space-y-0.5">
                    <Label for="event-show" class="text-base">
                        Add Link
                    </Label>
                    <p class="text-sm text-muted-foreground">This adds a button that lets people click a custom link.</p>
                </div>
                <Switch
                    id="event-show"
                    bind:checked={showLink}
                />
            </div>
            {#if showLink}
                <div class="space-y-2">
                    <input {...createCustomImageForm.fields.linkText.as("text")} value={linkText} class="sr-only" />
                    <Label for="event-name">Link Button Text</Label>
                    <Input
                        id="event-name"
                        placeholder="Link Button Text"
                        bind:value={linkText}
                    />
                </div>
                <div class="space-y-2">
                    <input {...createCustomImageForm.fields.registrationURL.as("url")} value={registrationURL} class="sr-only" />
                    <Label for="event-registration">Link URL</Label>
                    <Input
                        id="event-registration"
                        type="url"
                        placeholder="https://example.com/register"
                        bind:value={registrationURL}
                    />
                </div>
            {/if}
            {#each createCustomImageForm.fields.allIssues() as anIssue (`AformsubmitIssue${anIssue.message}`)}
                <p class="text-red-500">{anIssue.message}</p>
            {/each}
        </form>
        <Dialog.Footer>
            <Button variant="outline" onclick={() => dialogOpen = false} class="bg-transparent">
                Cancel
            </Button>
            <Button form="createCustomImageForm" type="submit" disabled={creatingForm}>
                {#if creatingForm}
                    Saving <Spinner />
                {:else}
                    Save
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>