<script lang="ts">
    import { Copy, MoreVertical, Plus, Shield, Trash2, Users } from "@lucide/svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    import * as DropdownMenu from "@/components/ui/dropdown-menu/index";
    import { Button, buttonVariants } from "@/components/ui/button";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import * as Dialog from "@/components/ui/dialog/index";
    import { Textarea } from "@/components/ui/textarea";
    import * as Card from "@/components/ui/card/index";
    import { Label } from "@/components/ui/label";
    import { Input } from "@/components/ui/input";
    import { cn } from "@/utils";
    import { toast } from "svelte-sonner";
    import NoCalendarAvatar from "@/NoCalendarAvatar.svelte";
    import { afterNavigate, goto, invalidateAll } from "$app/navigation";
    import { deleteCalendar } from "@/endpointCalls/deleteCalendar.js";
    import { Switch } from "@/components/ui/switch/index.js";
    import { Spinner } from "@/components/ui/spinner/index.js";
    import { createCalendar } from "@/endpointCalls/createCalendar.js";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";

    let { data } = $props();

    let newCalendarDialogOpen = $state(false);
    let newCalendarDescription = $state("");
    let newCalendarName = $state("");
    let newCalendarPasswordEnabled = $state(false);
    let newCalendarPassword = $state("");
    let creatingCalendar = $state(false);

    async function handleCreateCalendar() {
        if (newCalendarName && newCalendarDescription) {
            creatingCalendar = true;
            const success = await createCalendar(newCalendarName, newCalendarDescription, newCalendarPasswordEnabled, newCalendarPassword, data.stripeUrl, data.user.userEmail);
            creatingCalendar = false;
            if (success) {
                newCalendarDialogOpen = false;
                newCalendarDescription = "";
                newCalendarName = "";
                newCalendarPasswordEnabled = false;
                newCalendarPassword = "";

                let updating = toast.info("Updating Calendar List");
                await invalidateAll();
                toast.dismiss(updating);
            }
        } else {
            toast.error("Missing Fields.");
        }
    }

    function copyCalLinkToClipboard(id: string) {
        const link = `${window.location.origin}/cal/${id}`;

        navigator.clipboard.writeText(link);

        toast.info("Copied", {
            description: link,
            descriptionClass: "underline"
        })
    }

    let deleteCalendarId: string | null = $state(null);

    async function deleteCal() {
        if (deleteCalendarId === null) return
        const deletingCalendar = toast.loading("Deleting Calendar");
        const success = await deleteCalendar(deleteCalendarId);
        toast.dismiss(deletingCalendar);
        deleteCalendarId = null;
        if (success) {
            invalidateAll();
        }
    }

    afterNavigate(() => {
		if (browser) {
            newCalendarDialogOpen = $page.url.searchParams.get("new") === "1";
		}
	});
</script>

<svelte:head>
    <title>My Calendars | InfoSections</title>
</svelte:head>

<div class="w-full h-full space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold text-foreground">My Calendars</h1>
            <p class="text-muted-foreground mt-1">Customisable calendars that can be accessed anywhere by anyone (Unless it's password protected.)</p>
        </div>

        <Dialog.Root bind:open={newCalendarDialogOpen}>
        <Dialog.Trigger class={cn(buttonVariants({ variant: "default" }), "gap-2")}>
            <Plus class="h-4 w-4" />
            New Calendar
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[500px]">
            <Dialog.Header>
            <Dialog.Title>Create New Calendar</Dialog.Title>
                <Dialog.Description>You can change more settings after creating the calendar.</Dialog.Description>
            </Dialog.Header>

            <div class="space-y-4 py-4">
                <div class="space-y-2">
                    <Label for="name">Calendar Name</Label>
                    <Input
                    id="name"
                    placeholder="e.g., Published Events"
                    bind:value={newCalendarName}
                    />
                </div>

                <div class="space-y-2">
                    <Label for="description">Description</Label>
                    <Textarea
                    id="description"
                    placeholder="Brief description of this calendar type"
                    bind:value={newCalendarDescription}
                    rows={3}
                    />
                </div>
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                    <Label for="password-protection" class="text-base">
                        Password Protection
                    </Label>
                    <p class="text-sm text-muted-foreground">Require a password to access this calendar</p>
                    </div>
                    <Switch id="password-protection" bind:checked={newCalendarPasswordEnabled} />
                </div>

                {#if newCalendarPasswordEnabled}
                    <div class="space-y-2 pt-2">
                        <Label for="password">Calendar Password</Label>
                        <Input id="password" bind:value={newCalendarPassword} type="password" placeholder="Enter password" />
                    </div>
                {/if}
            </div>

            <Dialog.Footer>
            <Button variant="outline" onclick={() => newCalendarDialogOpen = false}>
                Cancel
            </Button>
            <Button onclick={handleCreateCalendar}>
                {#if creatingCalendar}
                    <Spinner />
                    Creating Calendar...
                {:else}
                    Create Calendar
                {/if}
            </Button>
            </Dialog.Footer>
        </Dialog.Content>
        </Dialog.Root>
    </div>

    <div class="w-full h-full grid gap-4 xl:grid-cols-3 relative">
        {#if data.calendars.length === 0}
            <p class="absolute top-3 left-1/2 -translate-1/2 text-muted-foreground">No Calendars Yet.</p>
        {/if}
        {#each data.calendars as calendar (`calendarlist${calendar.id}`)}
            <Card.Root class="hover:shadow-lg transition-shadow">
                <Card.Header>
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-1">
                        <Avatar.Root class="h-15 w-15">
                            <Avatar.Image src="{data.pb_url}/api/files/{calendar.collectionId}/{calendar.id}/{calendar.logo}" alt="Avatar" />
                            <Avatar.Fallback><NoCalendarAvatar /></Avatar.Fallback>
                        </Avatar.Root>
                        <div>
                            <Card.Title class="text-lg flex">
                                {calendar.name}
                                {#if calendar.passwordEnabled}
                                    <div class="flex items-center gap-1 ml-1 text-xs text-muted-foreground">
                                        <span>•</span>
                                        <Tooltip.Provider>
                                            <Tooltip.Root>
                                                <Tooltip.Trigger>
                                                    <Shield class="h-4 w-4" />
                                                </Tooltip.Trigger>
                                                <Tooltip.Content>Password Protected</Tooltip.Content>
                                            </Tooltip.Root>
                                        </Tooltip.Provider>
                                    </div>
                                {/if}
                            </Card.Title>
                            <Card.Description class="text-sm mt-1">/cal/{calendar.id}</Card.Description>
                        </div>
                    </div>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger class={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8")}>
                            <MoreVertical class="h-4 w-4" />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                            <DropdownMenu.Item
                                onclick={() => copyCalLinkToClipboard(calendar.id)}
                            >
                                <Copy class="h-4 w-4 mr-2 data-highlighted:text-primary" />
                                Copy Link
                            </DropdownMenu.Item>

                            <DropdownMenu.Item class="text-destructive" onclick={() => {deleteCalendarId = calendar.id}}>
                                <Trash2 class="h-4 w-4 mr-2 data-highlighted:text-primary" />
                                Delete
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
                </Card.Header>

                <Card.Content>
                    <p class="text-sm text-muted-foreground mb-4">{calendar.description}</p>

                    <div class="flex items-center justify-between pt-4 border-t border-border">
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users class="h-4 w-4" />
                            <span>{calendar.visits} Visit{calendar.visits === 1 ? "" : "s"}</span>
                        </div>

                        <Button variant="outline" size="sm" href="/dashboard/calendars/{calendar.id}">
                            View Details
                        </Button>
                    </div>
                </Card.Content>
            </Card.Root>
        {/each}
    </div>
</div>

<!-- Delete Calendar Dialog -->
<Dialog.Root open={deleteCalendarId !== null} onOpenChange={() => deleteCalendarId = null}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
            <Dialog.Description>
                This action cannot be undone. This will permanently delete this calendar from our servers. All links relying on this calendar will not work.
            </Dialog.Description>
            <Dialog.Footer>
                <Button variant="destructive" onclick={deleteCal}>Confirm Delete</Button>
            </Dialog.Footer>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>