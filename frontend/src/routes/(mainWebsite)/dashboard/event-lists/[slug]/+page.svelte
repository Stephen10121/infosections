<script lang="ts">
    import { ArrowLeft, Copy, Link2, SquareArrowOutUpRight, Upload, X } from "@lucide/svelte";
    import { changeIListSettings } from "@/endpointCalls/changeIListSettings.js";
    import { Button, buttonVariants } from "@/components/ui/button";
    import { deleteEList } from "@/endpointCalls/deleteEList.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import NoEventListAvatar from "@/NoEventListAvatar.svelte";
    import { Switch } from "@/components/ui/switch/index.js";
    import { goto, invalidateAll } from "$app/navigation";
    import { Textarea } from "@/components/ui/textarea";
    import * as Card from "@/components/ui/card/index";
    import { clearFileInput, cn } from "@/utils.js";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Temporal } from "temporal-polyfill";
    import PrettyDate from "@/PrettyDate.svelte";
    import { toast } from "svelte-sonner";
    import Event from "@/Event.svelte";

    let { data } = $props();

    let timeZone = $state(Temporal.Now.timeZoneId());
    let avatarLink = $derived(data.selectedlist.logo ? `${data.pb_url}/api/files/${data.selectedlist.collectionId}/${data.selectedlist.id}/${data.selectedlist.logo}` : "");

    let uploadNewAvatar: File | null = $state(null);
    let uploadNewAvatarLink = $derived(uploadNewAvatar ? URL.createObjectURL(uploadNewAvatar) : null);

    let displaySettingsRef = $derived(data.selectedlist.displaySettings);
    let displaySettings = $state(data.selectedlist.displaySettings);
    let eListDescription = $derived(data.selectedlist.description);
    let saveChangesToast: string | number | null = $state(null);
    let filterSettingsRef = $derived(data.selectedlist.filters);
    let filterSettings = $state(data.selectedlist.filters);
    let eListName = $derived(data.selectedlist.name);
    let previewIFrame: HTMLIFrameElement | undefined = $state();

    // This effect checks if any configurations have changed. If so, the saveRequired state will be set to true.
    $effect(() => {
        const newAvatarUploaded = uploadNewAvatar !== null;
        const currentAvatarRemoved = avatarLink !== (data.selectedlist.logo ? `${data.pb_url}/api/files/${data.selectedlist.collectionId}/${data.selectedlist.id}/${data.selectedlist.logo}` : "");
        const nameChanged = eListName !== data.selectedlist.name;
        const descriptionChanged = eListDescription !== data.selectedlist.description;
        const displaySettingsChanged = JSON.stringify(displaySettings) !== JSON.stringify(displaySettingsRef);
        const filterSettingsChanged = JSON.stringify(filterSettings) !== JSON.stringify(filterSettingsRef);

        const saveRequired = newAvatarUploaded || currentAvatarRemoved || nameChanged || descriptionChanged || displaySettingsChanged || filterSettingsChanged;

        if (saveRequired) {
            if (saveChangesToast === null) {
                saveChangesToast = toast("Save?", {
                    description: "You have some unsaved changes.",
                    dismissable: false,
                    duration: Number.POSITIVE_INFINITY,
                    action: {
                        label: "Save Changes",
                        onClick: saveChanges
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

    $effect(() => {
        if (displaySettings && previewIFrame && previewIFrame.contentWindow) {
            previewIFrame.contentWindow.postMessage({ call: 'displaySettings', value: JSON.stringify(displaySettings) });
            setTimeout(() => {
                iframeLoaded();
            }, 0);
        }
    });

    $effect(() => {
        displaySettings = displaySettingsRef;
    });

    $effect(() => {
        filterSettings = filterSettingsRef;
    });

    function handleRemoveAvatar() {
        clearFileInput(document.getElementById("imageUploaderIList"))
        uploadNewAvatar = null;
        avatarLink = "";
    }

    function handleAvatarChange(event: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
        //@ts-ignore
        const files = event.target.files as File[];
        if (files.length === 0) return;
        uploadNewAvatar = files[0];
        avatarLink = "";
    }

    function handleCopyLink() {
        const link = `${window.location.origin}/elist/${data.selectedlist.id}`;

        navigator.clipboard.writeText(link);

        toast.info("Copied", {
            description: link,
            descriptionClass: "underline"
        })
    }

    async function saveChanges() {
        const savingChangesToast = toast.loading("Saving changes!");
        const success = await changeIListSettings(data.selectedlist.id, eListName, eListDescription, avatarLink, uploadNewAvatar, displaySettings, filterSettings);
        if (success) {
            clearFileInput(document.getElementById("imageUploaderIList"));
            uploadNewAvatar = null;
            await invalidateAll();
        }
        toast.dismiss(savingChangesToast);
    }

    async function deleteCal() {
        const success = await deleteEList(data.selectedlist.id);
        if (success) {
            goto("/dashboard/event-lists");
        }
    }

    function iframeLoaded() {
        try {
           const iFrameID = document.getElementById('eventListPreviewFrame');
            if(iFrameID) {
                // @ts-ignore
                iFrameID.height = "";
                // @ts-ignore
                iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + "px";
            }  
        } catch (_err) {
            console.log("Oops. Iframe wasnt loaded.")
        }
    }
</script>

<svelte:head>
    <title>{data.selectedlist.name} | InfoSections</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" href="/dashboard/event-lists">
            <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
            <h1 class="text-3xl font-bold text-foreground">{data.selectedlist.name} | List Details</h1>
            <p class="text-muted-foreground mt-1">Manage your event list settings and filters.</p>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
            <Card.Root>
                <Card.Header>
                    <Card.Title>List Avatar</Card.Title>
                    <Card.Description>Upload an image to represent your event list.</Card.Description>
                </Card.Header>
                <Card.Content>
                <div class="flex items-start gap-6">
                    <div class="relative">
                        {#if avatarLink.length > 0 || uploadNewAvatar}
                            <div class="relative group">
                                <img
                                    src={uploadNewAvatar !== null ? uploadNewAvatarLink : avatarLink}
                                    alt="List Avatar"
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
                                <NoEventListAvatar />
                            </div>
                        {/if}
                    </div>
                    <div class="flex-1 space-y-3">
                    <div>
                        <p class="text-sm text-foreground font-medium">Upload a custom avatar</p>
                        <p class="text-sm text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <Button variant="outline" class="relative bg-transparent">
                        <Upload class="h-4 w-4 mr-2" />
                        Upload Image
                        <input
                            id="imageUploaderIList"
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

            <Card.Root>
                <Card.Header>
                <Card.Title>General Information</Card.Title>
                <Card.Description>Basic details about your event list</Card.Description>
                </Card.Header>
                <Card.Content class="space-y-4">
                <div class="space-y-2">
                    <Label for="list-id">List ID</Label>
                    <Input id="list-id" value={data.selectedlist.id} disabled class="font-mono text-sm" />
                </div>

                <div class="space-y-2">
                    <Label for="list-name">List Name</Label>
                    <Input
                        id="list-name"
                        bind:value={eListName}
                        placeholder="Enter list name"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="list-description">Description</Label>
                    <Textarea
                    id="list-description"
                    bind:value={eListDescription}
                    placeholder="Enter list description"
                    rows={3}
                    />
                </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Display Settings</Card.Title>
                    <Card.Description>Customize how event information is displayed</Card.Description>
                </Card.Header>
                <Card.Content>
                <div class="grid grid-cols-1 gap-6">
                    <div class="flex items-center justify-between space-x-2">
                        <Label for="showEventHeader" class="flex flex-col space-y-1 items-start cursor-pointer">
                            <span class="font-medium">Display List Header</span>
                            <span class="text-sm text-muted-foreground">Display the "Upcoming Events" text and the description below.</span>
                        </Label>
                        <Switch
                            id="showEventHeader"
                            bind:checked={displaySettings.showUpcomingEventsTextAndDesc}
                        />
                    </div>

                    <div class="flex items-center justify-between space-x-2">
                        <Label for="showEventName" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Event Name</span>
                            <span class="text-sm text-muted-foreground">Show the official event name with the image.</span>
                        </Label>
                        <Switch
                            id="showEventName"
                            bind:checked={displaySettings.showEventName}
                        />
                    </div>

                    <div class="flex items-center justify-between space-x-2">
                        <Label for="showEventDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Event Description</span>
                            <span class="text-sm text-muted-foreground">Show the official event description IF one was applied for an event.</span>
                        </Label>
                        <Switch
                            id="showEventDescription"
                            bind:checked={displaySettings.showEventDescription}
                        />
                    </div>

                    <div class="flex items-center justify-between space-x-2">
                        <Label for="showEventRegistration" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Register Button</span>
                            <span class="text-sm text-muted-foreground">If an event has a registration URL set, a link can be provided to the user.</span>
                        </Label>
                        <Switch
                            id="showEventRegistration"
                            bind:checked={displaySettings.showEventRegistration}
                        />
                    </div>

                    <div class="flex items-center justify-between space-x-2">
                        <Label for="setTransparentBackground" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Transparent Background</span>
                            <span class="text-sm text-muted-foreground">Sets the background of the iframe window to transparent. But remember to set your iframe arguments to enable transparency.</span>
                        </Label>
                        <Switch
                            id="setTransparentBackground"
                            bind:checked={displaySettings.setTransparentBackground}
                        />
                    </div>
                </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Elist Preview</Card.Title>
                    <Card.Description>See the current changes in this preview before saving the settings.</Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="w-full">
                        <iframe     
                            bind:this={previewIFrame}
                            onload={iframeLoaded}
                            style="background: none transparent; border: none;"
                            allowtransparency
                            width="100%"
                            height="100%"
                            src="/elistPreview/{data.selectedlist.id}"
                            title="Event List Preview"
                            id="eventListPreviewFrame"
                            frameborder="0"
                        ></iframe>
                    </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Filter Settings</Card.Title>
                    <Card.Description>Choose what kind of events you want to show in the list (Changes not reflected in Elist preview!)</Card.Description>
                </Card.Header>
                <Card.Content>
                <div class="grid grid-cols-1 gap-6">
                    <div class="flex items-center justify-between space-x-2">
                        <Label for="onlyShowFeatured" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Only Featured Events</span>
                            <span class="text-sm text-muted-foreground">Show only the events that are set to featured.</span>
                        </Label>
                        <Switch
                            id="onlyShowFeatured"
                            bind:checked={filterSettings.onlyShowFeatured}
                        />
                    </div>
                    <div class="flex items-center justify-between space-x-2">
                        <Label for="hideUnpublished" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Hide Unpublished Events</span>
                            <span class="text-sm text-muted-foreground">Hide the events that are not visible in the church center.</span>
                        </Label>
                        <Switch
                            id="hideUnpublished"
                            bind:checked={filterSettings.hideUnpublished}
                        />
                    </div>
                </div>
                </Card.Content>
            </Card.Root>
        </div>

        <div class="space-y-6 stickySidebar h-fit">
        <Card.Root>
            <Card.Header>
                <Card.Title>Link</Card.Title>
                <Card.Description>Share this list with others</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-3">
                <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Link2 class="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span class="text-sm font-mono truncate">/elist/{data.selectedlist.id}</span>
                </div>
                <Button onclick={handleCopyLink} class="w-full gap-2 bg-transparent" variant="outline">
                    <Copy class="h-4 w-4" />
                    Copy Link
                </Button>
                <Button class="w-full gap-2" href="/elist/{data.selectedlist.id}" target="_blank">
                    <SquareArrowOutUpRight class="h-4 w-4" />
                    Goto Page
                </Button>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Statistics</Card.Title>
                <Card.Description>List performance</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-muted-foreground">Visits</span>
                        <span class="font-semibold text-foreground">{data.selectedlist.visits}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-muted-foreground">Created</span>
                        <span class="font-semibold text-foreground"><PrettyDate date={Temporal.Instant.from(data.selectedlist.created).toZonedDateTimeISO(timeZone)} /></span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-muted-foreground">Updated</span>
                        <span class="font-semibold text-foreground"><PrettyDate date={Temporal.Instant.from(data.selectedlist.updated).toZonedDateTimeISO(timeZone)} /></span>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
                <!-- Delete List Dialog -->
                <Dialog.Root>
                    <Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-destructive hover:bg-red-500 bg-transparent")}>
                        Delete List
                    </Dialog.Trigger>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
                            <Dialog.Description>
                                This action cannot be undone. This will permanently delete this evemt list from our servers. All links relying on this list will not work.
                            </Dialog.Description>
                            <Dialog.Footer>
                                <Button variant="destructive" onclick={deleteCal}>Confirm Delete</Button>
                            </Dialog.Footer>
                        </Dialog.Header>
                    </Dialog.Content>
                </Dialog.Root>
            </Card.Content>
        </Card.Root>
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