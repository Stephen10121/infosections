<script lang="ts">
    import { Copy, MoreVertical, Plus, Trash2, Users } from "@lucide/svelte";
    import * as DropdownMenu from "@/components/ui/dropdown-menu/index";
    import { Button, buttonVariants } from "@/components/ui/button";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { createEList } from "@/endpointCalls/createEList.js";
    import { deleteEList } from "@/endpointCalls/deleteEList.js";
    import { Spinner } from "@/components/ui/spinner/index.js";
    import NoEventListAvatar from "@/NoEventListAvatar.svelte";
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

    let newEListDialogOpen = $state(false);
    let newEListDescription = $state("");
    let newEListName = $state("");
    let creatingEList = $state(false);

    async function handleCreateEList() {
        if (newEListName && newEListDescription) {
            creatingEList = true;
            const success = await createEList(newEListName, newEListDescription, data.stripeUrl, data.user.userEmail);
            creatingEList = false;
            if (success) {
                newEListDialogOpen = false;
                newEListDescription = "";
                newEListName = "";

                let updating = toast.info("Updating IFeed List");
                await invalidateAll();
                toast.dismiss(updating);
            }
        } else {
            toast.error("Missing Fields.");
        }
    }

    function copyEListLinkToClipboard(id: string) {
        const link = `${window.location.origin}/elist/${id}`;

        navigator.clipboard.writeText(link);

        toast.info("Copied", {
            description: link,
            descriptionClass: "underline"
        })
    }

    let deleteEListId: string | null = $state(null);

    async function deleteEventList() {
        if (deleteEListId === null) return

        const deletingEList = toast.loading("Deleting Event List");
        const success = await deleteEList(deleteEListId);
        toast.dismiss(deletingEList);
        deleteEListId = null;
        
        if (success) {
            invalidateAll();
        }
    }

    afterNavigate(() => {
		if (browser) {
            newEListDialogOpen = $page.url.searchParams.get("new") === "1";
		}
	});
</script>

<svelte:head>
    <title>My Event Lists | InfoSections</title>
</svelte:head>

<div class="w-full h-full space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold text-foreground">My Event Lists</h1>
            <p class="text-muted-foreground mt-1">Any upcoming events can be displayed as an event list in any project that supports iframes.</p>
        </div>

        <Dialog.Root bind:open={newEListDialogOpen}>
        <Dialog.Trigger class={cn(buttonVariants({ variant: "default" }), "gap-2")}>
            <Plus class="h-4 w-4" />
            New Event List
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[500px]">
            <Dialog.Header>
            <Dialog.Title>Create New Event List</Dialog.Title>
                <Dialog.Description>You can change more settings after creating the list.</Dialog.Description>
            </Dialog.Header>

            <div class="space-y-4 py-4">
                <div class="space-y-2">
                    <Label for="name">List Name</Label>
                    <Input
                    id="name"
                    placeholder="e.g., Church Website List"
                    bind:value={newEListName}
                    />
                </div>

                <div class="space-y-2">
                    <Label for="description">Description</Label>
                    <Textarea
                    id="description"
                    placeholder="Brief description of this list type"
                    bind:value={newEListDescription}
                    rows={3}
                    />
                </div>
            </div>

            <Dialog.Footer>
            <Button variant="outline" onclick={() => newEListDialogOpen = false}>
                Cancel
            </Button>
            <Button onclick={handleCreateEList}>
                {#if creatingEList}
                    <Spinner />
                    Creating Event List...
                {:else}
                    Create Event List
                {/if}
            </Button>
            </Dialog.Footer>
        </Dialog.Content>
        </Dialog.Root>
    </div>

    <div class="w-full h-full grid gap-4 xl:grid-cols-3 relative">
        {#if data.eventLists.length === 0}
            <p class="absolute top-3 left-1/2 -translate-1/2 text-muted-foreground">No Event Lists Yet.</p>
        {/if}
        {#each data.eventLists as eventList (`eventFeedlist${eventList.id}`)}
            <Card.Root class="hover:shadow-lg transition-shadow">
                <Card.Header>
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-1">
                        <Avatar.Root class="h-15 w-15">
                            <Avatar.Image src="{data.pb_url}/api/files/{eventList.collectionId}/{eventList.id}/{eventList.logo}" alt="Avatar" />
                            <Avatar.Fallback><NoEventListAvatar /></Avatar.Fallback>
                        </Avatar.Root>
                        <div>
                            <Card.Title class="text-lg flex">
                                {eventList.name}
                            </Card.Title>
                            <Card.Description class="text-sm mt-1">/elist/{eventList.id}</Card.Description>
                        </div>
                    </div>

                    <DropdownMenu.Root>
                    <DropdownMenu.Trigger class={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8")}>
                        <MoreVertical class="h-4 w-4" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                        <DropdownMenu.Item
                            onclick={() => copyEListLinkToClipboard(eventList.id)}
                        >
                        <Copy class="h-4 w-4 mr-2 data-highlighted:text-primary" />
                        Copy Link
                        </DropdownMenu.Item>
                        <DropdownMenu.Item class="text-destructive" onclick={() => {deleteEListId = eventList.id}}>
                        <Trash2 class="h-4 w-4 mr-2 data-highlighted:text-primary" />
                        Delete
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
                </Card.Header>

                <Card.Content>
                <p class="text-sm text-muted-foreground mb-4">{eventList.description}</p>

                <div class="flex items-center justify-between pt-4 border-t border-border">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users class="h-4 w-4" />
                    <span>{eventList.visits} Visit{eventList.visits === 1 ? "" : "s"}</span>
                    </div>

                    <Button variant="outline" size="sm" href="/dashboard/event-lists/{eventList.id}">
                    View Details
                    </Button>
                </div>
                </Card.Content>
            </Card.Root>
        {/each}
    </div>
</div>

<!-- Delete Event List Dialog -->
<Dialog.Root open={deleteEListId !== null} onOpenChange={() => deleteEListId = null}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
            <Dialog.Description>
                This action cannot be undone. This will permanently delete this event list from our servers. All links relying on this list will not work.
            </Dialog.Description>
            <Dialog.Footer>
                <Button variant="destructive" onclick={deleteEventList}>Confirm Delete</Button>
            </Dialog.Footer>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>