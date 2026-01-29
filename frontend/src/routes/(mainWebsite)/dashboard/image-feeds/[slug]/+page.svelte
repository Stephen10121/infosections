<script lang="ts">
    import { ArrowLeft, Copy, Link2, SquareArrowOutUpRight, Upload, X } from "@lucide/svelte";
    import { changeIFeedSettings } from "@/endpointCalls/changeIFeedSettings.js";
    import { Button, buttonVariants } from "@/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { deleteIFeed } from "@/endpointCalls/deleteIFeed.js";
    import NoImageFeedAvatar from "@/NoImageFeedAvatar.svelte";
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
    import CustomImages from "@/ifeedslug/CustomImages.svelte";
    import IncludedCalendars from "@/IncludedCalendars.svelte";

    let { data } = $props();

    let timeZone = $state(Temporal.Now.timeZoneId());
    let avatarLink = $derived(data.selectedfeed.logo ? `${data.pb_url}/api/files/${data.selectedfeed.collectionId}/${data.selectedfeed.id}/${data.selectedfeed.logo}` : "");

    let uploadNewAvatar: File | null = $state(null);
    let uploadNewAvatarLink = $derived(uploadNewAvatar ? URL.createObjectURL(uploadNewAvatar) : null);

    let displaySettingsRef = $derived(data.selectedfeed.displaySettings);
    let displaySettings = $state(data.selectedfeed.displaySettings);
    let iFeedDescription = $derived(data.selectedfeed.description);
    let saveChangesToast: string | number | null = $state(null);
    let filterSettingsRef = $derived(data.selectedfeed.filters);
    let filterSettings = $state(data.selectedfeed.filters);
    let iFeedName = $derived(data.selectedfeed.name);
    let previewIFrame: HTMLIFrameElement | undefined = $state();

    // This effect checks if any configurations have changed. If so, the saveRequired state will be set to true.
    $effect(() => {
        const newAvatarUploaded = uploadNewAvatar !== null;
        const currentAvatarRemoved = avatarLink !== (data.selectedfeed.logo ? `${data.pb_url}/api/files/${data.selectedfeed.collectionId}/${data.selectedfeed.id}/${data.selectedfeed.logo}` : "");
        const nameChanged = iFeedName !== data.selectedfeed.name;
        const descriptionChanged = iFeedDescription !== data.selectedfeed.description;
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
        }
    });

    $effect(() => {
        displaySettings = displaySettingsRef;
    });

    $effect(() => {
        filterSettings = filterSettingsRef;
    });

    function handleRemoveAvatar() {
        clearFileInput(document.getElementById("imageUploaderIFeed"))
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
        const link = `${window.location.origin}/ifeed/${data.selectedfeed.id}`;

        navigator.clipboard.writeText(link);

        toast.info("Copied", {
            description: link,
            descriptionClass: "underline"
        })
    }

    async function saveChanges() {
        const savingChangesToast = toast.loading("Saving changes!");
        const success = await changeIFeedSettings(data.selectedfeed.id, iFeedName, iFeedDescription, avatarLink, uploadNewAvatar, displaySettings, filterSettings);
        if (success) {
            clearFileInput(document.getElementById("imageUploaderIFeed"));
            uploadNewAvatar = null;
            await invalidateAll();
        }
        toast.dismiss(savingChangesToast);
    }

    async function deleteCal() {
        const success = await deleteIFeed(data.selectedfeed.id);
        if (success) {
            goto("/dashboard/image-feeds");
        }
    }
</script>

<svelte:head>
    <title>{data.selectedfeed.name} | InfoSections</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" href="/dashboard/image-feeds">
            <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
            <h1 class="text-3xl font-bold text-foreground">{data.selectedfeed.name} | Feed Details</h1>
            <p class="text-muted-foreground mt-1">Manage your image feed settings and filters.</p>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
            <Card.Root>
                <Card.Header>
                    <Card.Title>Feed Avatar</Card.Title>
                    <Card.Description>Upload an image to represent your image feed</Card.Description>
                </Card.Header>
                <Card.Content>
                <div class="flex items-start gap-6">
                    <div class="relative">
                        {#if avatarLink.length > 0 || uploadNewAvatar}
                            <div class="relative group">
                                <img
                                    src={uploadNewAvatar !== null ? uploadNewAvatarLink : avatarLink}
                                    alt="Feed Avatar"
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
                        <p class="text-sm text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <Button variant="outline" class="relative bg-transparent">
                        <Upload class="h-4 w-4 mr-2" />
                        Upload Image
                        <input
                            id="imageUploaderIFeed"
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
                <Card.Description>Basic details about your image feed</Card.Description>
                </Card.Header>
                <Card.Content class="space-y-4">
                <div class="space-y-2">
                    <Label for="feed-id">Feed ID</Label>
                    <Input id="feed-id" value={data.selectedfeed.id} disabled class="font-mono text-sm" />
                </div>

                <div class="space-y-2">
                    <Label for="feed-name">Feed Name</Label>
                    <Input
                        id="feed-name"
                        bind:value={iFeedName}
                        placeholder="Enter feed name"
                    />
                </div>

                <div class="space-y-2">
                    <Label for="feed-description">Description</Label>
                    <Textarea
                    id="feed-description"
                    bind:value={iFeedDescription}
                    placeholder="Enter feed description"
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
                        <Label for="showEventExtraInfo" class="flex flex-col space-y-1 items-start cursor-pointer">
                            <span class="font-medium">Display Extra Event Information</span>
                            <span class="text-sm text-muted-foreground">Display things like the event name, description, registration button.</span>
                        </Label>
                        <Switch
                            id="showEventExtraInfo"
                            bind:checked={displaySettings.showEventExtraInfo}
                        />
                    </div>

                    {#if displaySettings.showEventExtraInfo}
                        <div class="flex items-center justify-between space-x-2 ml-5">
                            <Label for="showEventName" class="flex flex-col items-start space-y-1 cursor-pointer">
                                <span class="font-medium">Event Name</span>
                                <span class="text-sm text-muted-foreground">Show the official event name with the image.</span>
                            </Label>
                            <Switch
                                id="showEventName"
                                bind:checked={displaySettings.showEventName}
                            />
                        </div>

                        <div class="flex items-center justify-between space-x-2 ml-5">
                            <Label for="showEventDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                                <span class="font-medium">Event Description</span>
                                <span class="text-sm text-muted-foreground">Show the official event description IF one was applied for an event.</span>
                            </Label>
                            <Switch
                                id="showEventDescription"
                                bind:checked={displaySettings.showEventDescription}
                            />
                        </div>

                        <div class="flex items-center justify-between space-x-2 ml-5">
                            <Label for="showEventRegistration" class="flex flex-col items-start space-y-1 cursor-pointer">
                                <span class="font-medium">Register Button</span>
                                <span class="text-sm text-muted-foreground">If an event has a registration URL set, a link can be provided to the user.</span>
                            </Label>
                            <Switch
                                id="showEventDesshowEventRegistrationcription"
                                bind:checked={displaySettings.showEventRegistration}
                            />
                        </div>
                    {/if}

                    {#if displaySettings.feedAnimationType === "slideshow"}
                        <div class="space-y-2">
                            <Label for="feedDurationMS" class="flex flex-col items-start space-y-1 cursor-pointer">
                                <span class="font-medium">Slideshow Duration</span>
                                <span class="text-sm text-muted-foreground">How long you want to show each slide in milliseconds.</span>
                            </Label>
                            <Input
                                id="feedDurationMS"
                                type="number"
                                bind:value={displaySettings.feedDurationMS}
                            />
                        </div>
                    {/if}
                </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Ifeed Preview</Card.Title>
                    <Card.Description>See the current changes in this preview before saving the settings.</Card.Description>
                </Card.Header>
                <Card.Content>
                    <div class="w-full {displaySettings.feedAnimationType === "slideshow" ? "aspect-video" : "h-96"}">
                        <iframe     
                            bind:this={previewIFrame}
                            allowtransparency
                            style="background: none;height:100%"
                            width="100%"
                            height="100%"
                            src="/ifeedPreview/{data.selectedfeed.id}"
                            title="Image Feed Preview"
                            frameborder="0"
                        ></iframe>
                    </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Filter Settings</Card.Title>
                    <Card.Description>Choose what kind of events you want to show in the feed (Changes not reflected in Ifeed preview!)</Card.Description>
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
                    <div class="flex items-center justify-between space-x-2">
                        <Label for="hideRecurring" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Hide Recurring Events</span>
                            <span class="text-sm text-muted-foreground">Hide events that are recurring but show only the first instance of the event in the feed.</span>
                        </Label>
                        <Switch
                            id="hideRecurring"
                            bind:checked={filterSettings.hideRecurringEvents}
                        />
                    </div>
                </div>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Additional Images</Card.Title>
                    <Card.Description>Add any extra pics that are not in planning center, but you want in the image feed. (Changes not reflected in Ifeed preview!)</Card.Description>
                </Card.Header>
                <Card.Content>
                    <CustomImages customImages={data.customImages} apiServer={data.apiServer} imageFeeds={data.imageFeeds} currentFeedID={data.selectedfeed.id} />
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Included Calendars</Card.Title>
                    <Card.Description>You can also include 1 or more calendars that you have created in the <span><a class="underline" href="/dashboard/calendars">calendars page!</a></span> (Changes not reflected in Ifeed preview!)</Card.Description>
                </Card.Header>
                <Card.Content>
                    <IncludedCalendars iFeedId={data.selectedfeed.id} pb_url={data.pb_url} includedCalendars={data.selectedfeed.additionalCalendars} calendars={data.calendars} />
                </Card.Content>
            </Card.Root>
        </div>

        <div class="space-y-6 stickySidebar h-fit">
        <Card.Root>
            <Card.Header>
                <Card.Title>Link</Card.Title>
                <Card.Description>Share this feed with others</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-3">
                <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Link2 class="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span class="text-sm font-mono truncate">/ifeed/{data.selectedfeed.id}</span>
                </div>
                <Button onclick={handleCopyLink} class="w-full gap-2 bg-transparent" variant="outline">
                    <Copy class="h-4 w-4" />
                    Copy Link
                </Button>
                <Button class="w-full gap-2" href="/ifeed/{data.selectedfeed.id}" target="_blank">
                    <SquareArrowOutUpRight class="h-4 w-4" />
                    Goto Page
                </Button>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Statistics</Card.Title>
                <Card.Description>Calendar performance</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-muted-foreground">Visits</span>
                        <span class="font-semibold text-foreground">{data.selectedfeed.visits}</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-muted-foreground">Created</span>
                        <span class="font-semibold text-foreground"><PrettyDate date={Temporal.Instant.from(data.selectedfeed.created).toZonedDateTimeISO(timeZone)} /></span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-muted-foreground">Updated</span>
                        <span class="font-semibold text-foreground"><PrettyDate date={Temporal.Instant.from(data.selectedfeed.updated).toZonedDateTimeISO(timeZone)} /></span>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
                <!-- Delete Feed Dialog -->
                <Dialog.Root>
                    <Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-destructive hover:bg-red-500 bg-transparent")}>
                        Delete Feed
                    </Dialog.Trigger>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
                            <Dialog.Description>
                                This action cannot be undone. This will permanently delete this image feed from our servers. All links relying on this feed will not work.
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