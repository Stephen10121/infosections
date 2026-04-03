<script lang="ts">
    import { deleteCustomImageCommand } from "../../routes/(mainWebsite)/dashboard/image-feeds/IFeedCustomImageActions.remote";
    import { type CustomImageIFeedDBModel, type ImageFeedDBModel } from "@/utils";
    import Button, { buttonVariants } from "@/components/ui/button/button.svelte";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import UpdateCustomEvent from "./UpdateCustomEvent.svelte";
    import * as Empty from "$lib/components/ui/empty/index.js";
    import CreateCustomEvent from "./CreateCustomEvent.svelte";
    import Badge from "@/components/ui/badge/badge.svelte";
    import * as Dialog from "@/components/ui/dialog";
    import { ImagePlus } from "@lucide/svelte";
    import { toast } from "svelte-sonner";

    let { customImages, apiServer, imageFeeds, currentFeedID }: { customImages: CustomImageIFeedDBModel[], apiServer: string, imageFeeds: ImageFeedDBModel[], currentFeedID: string } = $props();

    let createCustomEventDialog = $state(false);
    let selectedEventIndex = $state(0);
    let showEvent = $state(false);

    function eventClicked(index: number) {
        selectedEventIndex = index;
        showEvent = true;
    }

    async function deleteEvent() {
        const selectedCustomImage = customImages[selectedEventIndex];
        if (!selectedCustomImage) return;

        const response = await deleteCustomImageCommand({ id: selectedCustomImage.id, currentFeedID });
        if (response.error) {
            toast.error(response.msg);
        } else {
            toast.success(response.msg);
            showEvent = false;
        }
    }
</script>
 
{#if customImages.length > 0}
    <Table.Root>
        <Table.Header>
            <Table.Row>
                <Table.Head class="w-25">Picture</Table.Head>
                <Table.Head class="text-end">Has Link</Table.Head>
            </Table.Row>
        </Table.Header>

        <Table.Body>
            {#each customImages as customEvent, index (`customeventrow${customEvent.id}`)}
                <Table.Row onclick={() => eventClicked(index)}>
                    <Table.Cell>
                        <img class="w-full aspect-video rounded-lg object-cover" src="{apiServer}api/files/{customEvent.collectionId}/{customEvent.id}/{customEvent.picture}" alt="@leerob" />
                    </Table.Cell>
                    <Table.Cell class="text-end">
                        <Badge variant="outline">{customEvent.showLink ? "Yes" : "No"}</Badge>
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
    <div class="w-full flex items-center justify-center mt-2">
        <Button variant="outline" class="w-full" onclick={() => createCustomEventDialog=true}>Add Image</Button>
    </div>
{:else}
    <Empty.Root>
        <Empty.Header>
            <Empty.Media variant="icon">
                <ImagePlus />
            </Empty.Media>
            <Empty.Title>No Pics Yet</Empty.Title>
            <Empty.Description>You haven't added any additional images yet.</Empty.Description>
        </Empty.Header>
        <Empty.Content>
            <Button onclick={() => createCustomEventDialog=true}>Add One</Button>
        </Empty.Content>
    </Empty.Root>
{/if}

<Sheet.Root bind:open={showEvent}>
    <Sheet.Content side="left">
        <Sheet.Header>
            <Sheet.Title>Custom Image</Sheet.Title>
            <Sheet.Description>Make changes to the image settings here. Click save when you're done.</Sheet.Description>
        </Sheet.Header>
        {#if showEvent}
            <UpdateCustomEvent {currentFeedID} {customImages} {apiServer} {imageFeeds} {selectedEventIndex} close={() => {showEvent = false}} />
        {/if}
        <Sheet.Footer>
            <Button form="updateEventForm" type="submit">Save changes</Button>
            <Dialog.Root>
                <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
                    Delete Image
                </Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
                        <Dialog.Description>
                            This action cannot be undone. This will permanently delete this image from our servers.
                        </Dialog.Description>
                        <Dialog.Footer>
                            <Button variant="destructive" type="reset" onclick={deleteEvent}>Confirm Delete</Button>
                        </Dialog.Footer>
                    </Dialog.Header>
                </Dialog.Content>
            </Dialog.Root>
        </Sheet.Footer>
    </Sheet.Content>
</Sheet.Root>

<CreateCustomEvent iFeedId={currentFeedID} bind:dialogOpen={createCustomEventDialog} />