<script lang="ts">
    import { Copy, MoreVertical, Plus, Trash2, Users } from "@lucide/svelte";
    import * as DropdownMenu from "@/components/ui/dropdown-menu/index";
    import { Button, buttonVariants } from "@/components/ui/button";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { createIFeed } from "@/endpointCalls/createIFeed.js";
    import { deleteIFeed } from "@/endpointCalls/deleteIFeed.js";
    import { Spinner } from "@/components/ui/spinner/index.js";
    import NoImageFeedAvatar from "@/NoImageFeedAvatar.svelte";
    import * as Dialog from "@/components/ui/dialog/index";
    import { Textarea } from "@/components/ui/textarea";
    import * as Card from "@/components/ui/card/index";
    import { afterNavigate, invalidateAll } from "$app/navigation";
    import { Label } from "@/components/ui/label";
    import { Input } from "@/components/ui/input";
    import { toast } from "svelte-sonner";
    import { cn } from "@/utils";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";

    let { data } = $props();

    let newIFeedDialogOpen = $state(false);
    let newIFeedDescription = $state("");
    let newIFeedName = $state("");
    let creatingIFeed = $state(false);

    async function handleCreateIFeed() {
        if (newIFeedName && newIFeedDescription) {
            creatingIFeed = true;
            const success = await createIFeed(newIFeedName, newIFeedDescription, data.stripeUrl, data.user.userEmail);
            creatingIFeed = false;
            if (success) {
                newIFeedDialogOpen = false;
                newIFeedDescription = "";
                newIFeedName = "";

                let updating = toast.info("Updating IFeed List");
                await invalidateAll();
                toast.dismiss(updating);
            }
        } else {
            toast.error("Missing Fields.");
        }
    }

    function copyIFeedLinkToClipboard(id: string) {
        const link = `${window.location.origin}/ifeed/${id}`;

        navigator.clipboard.writeText(link);

        toast.info("Copied", {
            description: link,
            descriptionClass: "underline"
        })
    }

    let deleteIFeedId: string | null = $state(null);

    async function deleteImageFeed() {
        if (deleteIFeedId === null) return

        const deletingCalendar = toast.loading("Deleting Image Feed");
        const success = await deleteIFeed(deleteIFeedId);
        toast.dismiss(deletingCalendar);
        deleteIFeedId = null;
        
        if (success) {
            invalidateAll();
        }
    }

    afterNavigate(() => {
		if (browser) {
            newIFeedDialogOpen = $page.url.searchParams.get("new") === "1";
		}
	});
</script>

<svelte:head>
    <title>My Image Feeds | InfoSections</title>
</svelte:head>

<div class="w-full h-full space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold text-foreground">My Image Feeds</h1>
            <p class="text-muted-foreground mt-1">Any upcoming events containing an image, can be displayed as an image feed in any project that supports iframes.</p>
        </div>

        <Dialog.Root bind:open={newIFeedDialogOpen}>
        <Dialog.Trigger class={cn(buttonVariants({ variant: "default" }), "gap-2")}>
            <Plus class="h-4 w-4" />
            New Image Feed
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[500px]">
            <Dialog.Header>
            <Dialog.Title>Create New Image Feed</Dialog.Title>
                <Dialog.Description>You can change more settings after creating the feed.</Dialog.Description>
            </Dialog.Header>

            <div class="space-y-4 py-4">
                <div class="space-y-2">
                    <Label for="name">Feed Name</Label>
                    <Input
                    id="name"
                    placeholder="e.g., Church Website Feed"
                    bind:value={newIFeedName}
                    />
                </div>

                <div class="space-y-2">
                    <Label for="description">Description</Label>
                    <Textarea
                    id="description"
                    placeholder="Brief description of this feed type"
                    bind:value={newIFeedDescription}
                    rows={3}
                    />
                </div>
            </div>

            <Dialog.Footer>
            <Button variant="outline" onclick={() => newIFeedDialogOpen = false}>
                Cancel
            </Button>
            <Button onclick={handleCreateIFeed}>
                {#if creatingIFeed}
                    <Spinner />
                    Creating Image Feed...
                {:else}
                    Create Image Feed
                {/if}
            </Button>
            </Dialog.Footer>
        </Dialog.Content>
        </Dialog.Root>
    </div>

    <div class="w-full h-full grid gap-4 xl:grid-cols-3 relative">
        {#if data.imageFeeds.length === 0}
            <p class="absolute top-3 left-1/2 -translate-1/2 text-muted-foreground">No Image Feeds Yet.</p>
        {/if}
        {#each data.imageFeeds as imageFeed (`imageFeedlist${imageFeed.id}`)}
            <Card.Root class="hover:shadow-lg transition-shadow">
                <Card.Header>
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-1">
                        <Avatar.Root class="h-15 w-15">
                            <Avatar.Image src="{data.pb_url}/api/files/{imageFeed.collectionId}/{imageFeed.id}/{imageFeed.logo}" alt="Avatar" />
                            <Avatar.Fallback><NoImageFeedAvatar /></Avatar.Fallback>
                        </Avatar.Root>
                        <div>
                            <Card.Title class="text-lg flex">
                                {imageFeed.name}
                            </Card.Title>
                            <Card.Description class="text-sm mt-1">/ifeed/{imageFeed.id}</Card.Description>
                        </div>
                    </div>

                    <DropdownMenu.Root>
                    <DropdownMenu.Trigger class={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8")}>
                        <MoreVertical class="h-4 w-4" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                        <DropdownMenu.Item
                            onclick={() => copyIFeedLinkToClipboard(imageFeed.id)}
                        >
                        <Copy class="h-4 w-4 mr-2 data-highlighted:text-primary" />
                        Copy Link
                        </DropdownMenu.Item>
                        <DropdownMenu.Item class="text-destructive" onclick={() => {deleteIFeedId = imageFeed.id}}>
                        <Trash2 class="h-4 w-4 mr-2 data-highlighted:text-primary" />
                        Delete
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
                </Card.Header>

                <Card.Content>
                <p class="text-sm text-muted-foreground mb-4">{imageFeed.description}</p>

                <div class="flex items-center justify-between pt-4 border-t border-border">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users class="h-4 w-4" />
                    <span>{imageFeed.visits} Visit{imageFeed.visits === 1 ? "" : "s"}</span>
                    </div>

                    <Button variant="outline" size="sm" href="/dashboard/image-feeds/{imageFeed.id}">
                    View Details
                    </Button>
                </div>
                </Card.Content>
            </Card.Root>
        {/each}
    </div>
</div>

<!-- Delete Image Feed Dialog -->
<Dialog.Root open={deleteIFeedId !== null} onOpenChange={() => deleteIFeedId = null}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
            <Dialog.Description>
                This action cannot be undone. This will permanently delete this image feed from our servers. All links relying on this feed will not work.
            </Dialog.Description>
            <Dialog.Footer>
                <Button variant="destructive" onclick={deleteImageFeed}>Confirm Delete</Button>
            </Dialog.Footer>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>