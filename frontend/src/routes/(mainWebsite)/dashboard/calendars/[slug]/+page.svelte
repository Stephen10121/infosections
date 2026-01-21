<script lang="ts">
    import { ArrowLeft, Copy, Link2, SquareArrowOutUpRight, Upload, X } from "@lucide/svelte";
    import { changeCalendarSettings } from "@/endpointCalls/changeCalendarSetting.js";
    import { deleteCalendar } from "@/endpointCalls/deleteCalendar.js";
    import { Button, buttonVariants } from "@/components/ui/button";
    import { Spinner } from "$lib/components/ui/spinner/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import NoCalendarAvatar from "@/NoCalendarAvatar.svelte";
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
    let nowDate = $derived(Temporal.Now.zonedDateTimeISO(timeZone));
    let avatarLink = $derived(data.selectedCalendar.logo ? `${data.pb_url}/api/files/${data.selectedCalendar.collectionId}/${data.selectedCalendar.id}/${data.selectedCalendar.logo}` : "");

    let uploadNewAvatar: File | null = $state(null);
    let uploadNewAvatarLink = $derived(uploadNewAvatar ? URL.createObjectURL(uploadNewAvatar) : null);

    let passwordScreenMessage = $derived(data.selectedCalendar.passwordScreenMessage);
    let displaySettingsRef = $derived(data.selectedCalendar.displaySettings);
    let calendarDescription = $derived(data.selectedCalendar.description);
    let passwordEnabled = $derived(data.selectedCalendar.passwordEnabled);
    let displaySettings = $state(data.selectedCalendar.displaySettings);
    let filterSettingsRef = $derived(data.selectedCalendar.filters);
    let filterSettings = $state(data.selectedCalendar.filters);
    let saveChangesToast: string | number | null = $state(null);
    let calendarName = $derived(data.selectedCalendar.name);
    let newPassword = $state("");

    // This effect checks if any configurations have changed. If so, the saveRequired state will be set to true.
    $effect(() => {
        const passwordEnableHasChanged = passwordEnabled !== data.selectedCalendar.passwordEnabled;
        const newAvatarUploaded = uploadNewAvatar !== null;
        const currentAvatarRemoved = avatarLink !== (data.selectedCalendar.logo ? `${data.pb_url}/api/files/${data.selectedCalendar.collectionId}/${data.selectedCalendar.id}/${data.selectedCalendar.logo}` : "");
        const newPasswordCreated = newPassword.length !== 0;
        const nameChanged = calendarName !== data.selectedCalendar.name;
        const descriptionChanged = calendarDescription !== data.selectedCalendar.description;
        const passwordScreenMessageChanged = passwordScreenMessage !== data.selectedCalendar.passwordScreenMessage;
        const displaySettingsChanged = JSON.stringify(displaySettings) !== JSON.stringify(displaySettingsRef);
        const filterSettingsChanged = JSON.stringify(filterSettings) !== JSON.stringify(filterSettingsRef);

        const saveRequired = passwordEnableHasChanged || newAvatarUploaded || currentAvatarRemoved || (passwordEnabled && newPasswordCreated) || nameChanged || descriptionChanged || (passwordEnabled && passwordScreenMessageChanged) || displaySettingsChanged || filterSettingsChanged;
    
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
        displaySettings = displaySettingsRef;
    });

    $effect(() => {
        filterSettings = filterSettingsRef;
    });

    function handleRemoveAvatar() {
        clearFileInput(document.getElementById("imageUploaderCalendar"))
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
        const link = `${window.location.origin}/cal/${data.selectedCalendar.id}`;

        navigator.clipboard.writeText(link);

        toast.info("Copied", {
            description: link,
            descriptionClass: "underline"
        })
    }

    let savingChanges = $state(false);
    async function saveChanges() {
        savingChanges = true;
        const savingChangesToast = toast.loading("Saving changes!");
        const success = await changeCalendarSettings(data.selectedCalendar.id, calendarName, calendarDescription, passwordEnabled, newPassword, avatarLink, uploadNewAvatar, passwordScreenMessage, displaySettings, filterSettings);
        newPassword = "";
        savingChanges = false;
        if (success) {
            clearFileInput(document.getElementById("imageUploaderCalendar"));
            uploadNewAvatar = null;
            await invalidateAll();
        }
        toast.dismiss(savingChangesToast);
    }

    async function deleteCal() {
        savingChanges = true;
        const success = await deleteCalendar(data.selectedCalendar.id);
        newPassword = "";
        savingChanges = false;
        if (success) {
            goto("/dashboard/calendars");
        }
    }
</script>

<svelte:head>
    <title>{data.selectedCalendar.name} | InfoSections</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6 isolate">
    <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" href="/dashboard/calendars">
            <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
        <h1 class="text-3xl font-bold text-foreground">{data.selectedCalendar.name} | Calendar Details</h1>
        <p class="text-muted-foreground mt-1">Manage your calendar settings and filters.</p>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
        <Card.Root>
            <Card.Header>
            <Card.Title>Calendar Avatar</Card.Title>
            <Card.Description>Upload an image to represent your calendar</Card.Description>
            </Card.Header>
            <Card.Content>
            <div class="flex items-start gap-6">
                <div class="relative">
                    {#if avatarLink.length > 0 || uploadNewAvatar}
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
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
            <Card.Title>General Information</Card.Title>
            <Card.Description>Basic details about your calendar</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
            <div class="space-y-2">
                <Label for="calendar-id">Calendar ID</Label>
                <Input id="calendar-id" value={data.selectedCalendar.id} disabled class="font-mono text-sm" />
            </div>

            <div class="space-y-2">
                <Label for="calendar-name">Calendar Name</Label>
                <Input
                id="calendar-name"
                bind:value={calendarName}
                placeholder="Enter calendar name"
                />
            </div>

            <div class="space-y-2">
                <Label for="calendar-description">Description</Label>
                <Textarea
                id="calendar-description"
                bind:value={calendarDescription}
                placeholder="Enter calendar description"
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
                    <Label for="showDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Show Description</span>
                        <span class="text-sm text-muted-foreground">If a description of an event was set, you can choose if you want to display that info.</span>
                    </Label>
                    <Switch
                        id="showDescription"
                        bind:checked={displaySettings.showDescription}
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <Label for="useAMPM" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Use AM/PM Format</span>
                        <span class="text-sm text-muted-foreground">Display times in 12-hour format</span>
                    </Label>
                    <Switch
                        id="useAMPM"
                        bind:checked={displaySettings.useAMPM}
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <Label for="showResources" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Show Resources</span>
                        <span class="text-sm text-muted-foreground">Display the resources that the event needs.</span>
                    </Label>
                    <Switch
                        id="showResources"
                        bind:checked={displaySettings.showResources}
                    />
                </div>

                {#if displaySettings.showResources}
                    <div class="flex items-center justify-between space-x-2 ml-5">
                        <Label for="showResourcePathname" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Show Resource Pathname</span>
                            <span class="text-sm text-muted-foreground">Display full resource paths</span>
                        </Label>
                        <Switch
                            id="showResourcePathname"
                            bind:checked={displaySettings.showResourcePathname}
                        />
                    </div>
                {/if}

                <div class="flex items-center justify-between space-x-2">
                    <Label for="showRooms" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Show Rooms</span>
                        <span class="text-sm text-muted-foreground">Display the rooms that the event needs.</span>
                    </Label>
                    <Switch
                        id="showRooms"
                        bind:checked={displaySettings.showRooms}
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <Label for="showLocation" class="flex flex-col space-y-1 items-start cursor-pointer">
                        <span class="font-medium">Show Location</span>
                        <span class="text-sm text-muted-foreground">Display location information in events</span>
                    </Label>
                    <Switch
                        id="showLocation"
                        bind:checked={displaySettings.showLocation}
                    />
                </div>

                {#if displaySettings.showLocation}
                    <div class="flex items-center justify-between space-x-2 ml-5">
                        <Label for="onlyShowLocationTitle" class="flex flex-col items-start space-y-1 cursor-pointer">
                            <span class="font-medium">Only Show Location Title</span>
                            <span class="text-sm text-muted-foreground">Hide detailed location information</span>
                        </Label>
                        <Switch
                            id="onlyShowLocationTitle"
                            bind:checked={displaySettings.onlyShowLocationTitle}
                        />
                    </div>
                {/if}
            </div>
            </Card.Content>
        </Card.Root>

        <Event calendarCustomizations={displaySettings} event={{
            recurrence: "",
            id: "blankEvent",
            name: "Event Info Preview",
            location: "Home - 1234 Main Street, Vancouver WA",
            registrationURL: "",
            imageURL: "",
            visibleInChurchCenter: true,
            featured: true,
            description: "This is a short description of this event.",
            times: [],
            resources: [{
                id: "res1",
                kind: "Room",
                name: "Kitchen",
                path_name: ""
            },
            {
                id: "res2",
                kind: "Room",
                name: "Santuary",
                path_name: ""
            },
            {
                id: "res3",
                kind: "Resource",
                name: "Projector",
                path_name: "Santuary"
            },
            {
                id: "res4",
                kind: "Resource",
                name: "Sound System",
                path_name: "Santuary"
            }],
            tags: [],
            startTime: nowDate.toString(),
            endTime: nowDate.toString(),
            collectionId: "",
            collectionName: ""
        }} currentDay={nowDate} timeZone={Temporal.Now.timeZoneId()} />

        <Card.Root>
            <Card.Header>
                <Card.Title>Filter Settings</Card.Title>
                <Card.Description>Choose what kind of events you want to show in the feed.</Card.Description>
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

        <Card.Root>
            <Card.Header>
            <Card.Title>Security Settings</Card.Title>
            <Card.Description>Control access to your calendar</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                    <Label for="password-protection" class="text-base">
                        Password Protection
                    </Label>
                    <p class="text-sm text-muted-foreground">Require a password to access this calendar</p>
                    </div>
                    <Switch id="password-protection" bind:checked={passwordEnabled} />
                </div>

                {#if passwordEnabled}
                    <div class="space-y-2 pt-2">
                        <Label for="password">Calendar Password</Label>
                        <Input id="password" bind:value={newPassword} type="password" placeholder="Enter password" />
                    </div>
                    <div class="space-y-2">
                        <Label for="passwordScreenMessage">Password Screen Message</Label>
                        <Textarea
                        id="passwordScreenMessage"
                        bind:value={passwordScreenMessage}
                        placeholder="Enter Password Screen Message"
                        rows={3}
                        />
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>

        <!-- <Card.Root>
            <Card.Header>
            <Card.Title>Calendar Preview</Card.Title>
            <Card.Description>How your calendar appears to visitors</Card.Description>
            </Card.Header>
            <Card.Content>
            <div class="border border-border rounded-lg p-6 bg-muted/30">
                <div class="flex items-start gap-4">
                {#if avatarLink.length > 0 || uploadNewAvatar}
                    <img
                    src={uploadNewAvatar !== null ? uploadNewAvatarLink : avatarLink}
                    alt="Calendar avatar"
                    class="w-12 h-12 rounded-lg object-cover"
                    />
                {:else}
                    <NoCalendarAvatar />
                {/if}
                <div class="flex-1">
                    <h3 class="text-xl font-semibold text-foreground">{calendarName}</h3>
                    <p class="text-sm text-muted-foreground mt-1">{calendarDescription}</p>
                    <div class="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Clock class="h-4 w-4" />
                    {#if passwordEnabled}
                        <span>•</span>
                        <Shield class="h-4 w-4" />
                        <span>Password Protected</span>
                    {/if}
                    </div>
                </div>
                </div>
            </div>
            </Card.Content>
        </Card.Root> -->
        </div>

        <div class="space-y-6 stickySidebar h-fit">
        <Card.Root>
            <Card.Header>
            <Card.Title>Link</Card.Title>
            <Card.Description>Share this calendar with others</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-3">
            <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Link2 class="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span class="text-sm font-mono truncate">/cal/{data.selectedCalendar.id}</span>
            </div>
            <Button onclick={handleCopyLink} class="w-full gap-2 bg-transparent" variant="outline">
                <Copy class="h-4 w-4" />
                Copy Link
            </Button>
            <Button class="w-full gap-2" href="/cal/{data.selectedCalendar.id}" target="_blank">
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
                    <span class="font-semibold text-foreground">{data.selectedCalendar.visits}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">Created</span>
                    <span class="font-semibold text-foreground"><PrettyDate date={Temporal.Instant.from(data.selectedCalendar.created).toZonedDateTimeISO(timeZone)} /></span>
                </div>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">Updated</span>
                    <span class="font-semibold text-foreground"><PrettyDate date={Temporal.Instant.from(data.selectedCalendar.updated).toZonedDateTimeISO(timeZone)} /></span>
                </div>
            </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-2">
                <!-- Delete Calendar Dialog -->
                <Dialog.Root>
                    <Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-destructive hover:bg-red-500 bg-transparent")}>
                        Delete Calendar
                    </Dialog.Trigger>
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