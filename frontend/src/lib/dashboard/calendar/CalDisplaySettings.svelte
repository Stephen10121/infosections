<script lang="ts">
    import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
    import type { CalendarCustomizations } from "@/cal.utils";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Card from "@/components/ui/card/index";
    import { Label } from "@/components/ui/label";
    import { Switch } from "@/components/ui/switch";

    let {
        displaySettings,
        displaySettingsPreview = $bindable(),
        changed = $bindable()
    }: {
        displaySettings: CalendarCustomizations,
        displaySettingsPreview: CalendarCustomizations,
        changed: boolean
    } = $props();

    // svelte-ignore state_referenced_locally
    let displaySettingsBindable = $state(displaySettings);
    $effect(() => {displaySettingsBindable = displaySettings});

    $effect(() => {
        changed = JSON.stringify(displaySettingsBindable) !== JSON.stringify(displaySettings);
    });

    $effect(() => {
        displaySettingsPreview = displaySettingsBindable;
    });
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Display Settings</Card.Title>
        <Card.Description>Customize how event information is displayed</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="grid grid-cols-1 gap-6">
            <div class="flex items-center justify-between flex-col space-y-2">
                <Label for="showDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">View Type</span>
                    <span class="text-sm text-muted-foreground">You can choose a 3 day, week, or a month view option. The smaller the view, more information can be displayed.</span>
                </Label>
                <input {...updateCalendarForm.fields.displaySettings.viewType.as("hidden", displaySettingsBindable.viewType)} />
                <Tabs.Root bind:value={displaySettingsBindable.viewType} class="w-full">
                    <Tabs.List class="w-full">
                        <Tabs.Trigger value="3day">3 Day</Tabs.Trigger>
                        <Tabs.Trigger value="week">7 Day</Tabs.Trigger>
                        <Tabs.Trigger value="month">Month</Tabs.Trigger>
                    </Tabs.List>
                </Tabs.Root>
            </div>

            <div class="flex items-center justify-between space-x-2">
                <Label for="showDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Show Description</span>
                    <span class="text-sm text-muted-foreground">If a description of an event was set, you can choose if you want to display that info.</span>
                </Label>
                <input {...updateCalendarForm.fields.displaySettings.showDescription.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showDescription} type="checkbox" />
                <Switch
                    id="showDescription"
                    bind:checked={displaySettingsBindable.showDescription}
                />
            </div>

            <div class="flex items-center justify-between space-x-2">
                <Label for="useAMPM" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Use AM/PM Format</span>
                    <span class="text-sm text-muted-foreground">Display times in 12-hour format</span>
                </Label>
                <input {...updateCalendarForm.fields.displaySettings.useAMPM.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.useAMPM} type="checkbox" />
                <Switch
                    id="useAMPM"
                    bind:checked={displaySettingsBindable.useAMPM}
                />
            </div>

            <div class="flex items-center justify-between space-x-2">
                <Label for="showResources" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Show Resources</span>
                    <span class="text-sm text-muted-foreground">Display the resources that the event needs.</span>
                </Label>
                <input {...updateCalendarForm.fields.displaySettings.showResources.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showResources} type="checkbox" />
                <Switch
                    id="showResources"
                    bind:checked={displaySettingsBindable.showResources}
                />
            </div>

            {#if displaySettingsBindable.showResources}
                <div class="flex items-center justify-between space-x-2 ml-5">
                    <Label for="showResourcePathname" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Show Resource Pathname</span>
                        <span class="text-sm text-muted-foreground">Display full resource paths</span>
                    </Label>
                    <input {...updateCalendarForm.fields.displaySettings.showResourcePathname.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showResourcePathname} type="checkbox" />
                    <Switch
                        id="showResourcePathname"
                        bind:checked={displaySettingsBindable.showResourcePathname}
                    />
                </div>
            {/if}

            <div class="flex items-center justify-between space-x-2">
                <Label for="showRooms" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Show Rooms</span>
                    <span class="text-sm text-muted-foreground">Display the rooms that the event needs.</span>
                </Label>
                <input {...updateCalendarForm.fields.displaySettings.showRooms.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showRooms} type="checkbox" />
                <Switch
                    id="showRooms"
                    bind:checked={displaySettingsBindable.showRooms}
                />
            </div>

            <div class="flex items-center justify-between space-x-2">
                <Label for="showLocation" class="flex flex-col space-y-1 items-start cursor-pointer">
                    <span class="font-medium">Show Location</span>
                    <span class="text-sm text-muted-foreground">Display location information in events</span>
                </Label>
                <input {...updateCalendarForm.fields.displaySettings.showLocation.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showLocation} type="checkbox" />
                <Switch
                    id="showLocation"
                    bind:checked={displaySettingsBindable.showLocation}
                />
            </div>

            {#if displaySettingsBindable.showLocation}
                <div class="flex items-center justify-between space-x-2 ml-5">
                    <Label for="onlyShowLocationTitle" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Only Show Location Title</span>
                        <span class="text-sm text-muted-foreground">Hide detailed location information</span>
                    </Label>
                    <input {...updateCalendarForm.fields.displaySettings.onlyShowLocationTitle.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.onlyShowLocationTitle} type="checkbox" />
                    <Switch
                        id="onlyShowLocationTitle"
                        bind:checked={displaySettingsBindable.onlyShowLocationTitle}
                    />
                </div>
            {/if}
        </div>
    </Card.Content>
</Card.Root>