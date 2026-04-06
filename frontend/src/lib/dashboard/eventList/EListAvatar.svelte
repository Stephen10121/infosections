<script lang="ts">
    import { updateEventListForm } from "../../../routes/(mainWebsite)/dashboard/event-lists/eventListActions.remote";
    import NoImageFeedAvatar from "@/NoImageFeedAvatar.svelte";
    import { type RemoteFormField } from "@sveltejs/kit";
    import * as Card from "@/components/ui/card/index";
    import { Button } from "@/components/ui/button";
    import { Upload, X } from "@lucide/svelte";
    import { clearFileInput } from "@/utils";

    let {
        changed = $bindable(),
        avatarLink,
        uploadNewAvatar = $bindable()
    }: {
        changed: boolean,
        avatarLink: string,
        uploadNewAvatar: File | null
    } = $props();

    let avatarLinkBindable = $derived(avatarLink);

    let uploadNewAvatarLink = $derived(uploadNewAvatar ? URL.createObjectURL(uploadNewAvatar) : null);

    function handleRemoveAvatar() {
        clearFileInput(document.getElementById("imageUploaderEventList"));
        uploadNewAvatar = null;
        avatarLinkBindable = "";
    }

    function handleAvatarChange(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
        //@ts-ignore
        const files = event.target.files as File[];
        if (files.length === 0) return;
        if (files[0]) {
            uploadNewAvatar = files[0];
            avatarLinkBindable = "";
        }
    }

    $effect(() => {
        const avatarLinkChanged = avatarLinkBindable !== avatarLink;
        const uploadNewAvatarChanged = uploadNewAvatar !== null;

        changed = avatarLinkChanged || uploadNewAvatarChanged;
    });
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>List Avatar</Card.Title>
        <Card.Description>Upload an image to represent your event list</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="flex items-start gap-6">
            <div class="relative">
                {#if avatarLinkBindable.length > 0 || uploadNewAvatar}
                    {#if avatarLinkBindable.length > 0}
                        <input {...updateEventListForm.fields["avatarLink"]?.as("hidden", avatarLinkBindable)} />
                    {/if}

                    <div class="relative group">
                        <img
                            src={uploadNewAvatar !== null ? uploadNewAvatarLink : avatarLink}
                            alt="IFeed avatar"
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
                        <NoImageFeedAvatar />
                    </div>
                {/if}
            </div>
            <div class="flex-1 space-y-3">
                <div>
                    <p class="text-sm text-foreground font-medium">Upload a custom avatar</p>
                    <p class="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.</p>
                </div>
                <div class="flex gap-2">
                    <Button variant="outline" class="relative bg-transparent">
                        <Upload class="h-4 w-4 mr-2" />
                        Upload Image
                        <input
                            {...(updateEventListForm.fields.newAvatar as unknown as RemoteFormField<File>).as("file")}
                            id="imageUploaderEventList"
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
    </Card.Content>
</Card.Root>