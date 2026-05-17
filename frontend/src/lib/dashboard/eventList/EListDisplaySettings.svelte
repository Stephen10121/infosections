<script lang="ts">
    import { updateEventListForm } from "../../../routes/(mainWebsite)/dashboard/event-lists/eventListActions.remote";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import type { ImageListCustomizations } from "@/utils";
    import * as Card from "@/components/ui/card/index";
    import { Switch } from "@/components/ui/switch";
    import { Label } from "@/components/ui/label";

    let {
        displaySettings,
        displaySettingsPreview = $bindable(),
        changed = $bindable()
    }: {
        displaySettings: ImageListCustomizations,
        displaySettingsPreview: ImageListCustomizations,
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
            {#if updateEventListForm.fields["displaySettings"]}
                <div class="flex justify-between flex-col space-y-2">
                    <Label for="showDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Display Style</span>
                        <span class="text-sm text-muted-foreground">You can choose a minimal or expanded option.</span>
                    </Label>
                    <input {...updateEventListForm.fields["displaySettings"]["displayStyle"].as("hidden", displaySettingsBindable.displayStyle)} />
                    <Tabs.Root bind:value={displaySettingsBindable.displayStyle} class="w-full">
                        <Tabs.List class="w-full">
                            <Tabs.Trigger value="minimal">Minimal</Tabs.Trigger>
                            <Tabs.Trigger value="expanded">Expanded</Tabs.Trigger>
                        </Tabs.List>
                    </Tabs.Root>
                </div>
                <div class="flex items-center justify-between space-x-2">
                    <Label for="showUpcomingEventsTextAndDesc" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Display List Header</span>
                        <span class="text-sm text-muted-foreground">Display the "Upcoming Events" text and the description below.</span>
                    </Label>
                    <input {...updateEventListForm.fields["displaySettings"]["showUpcomingEventsTextAndDesc"]?.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showUpcomingEventsTextAndDesc} type="checkbox" />
                    <Switch
                        id="showUpcomingEventsTextAndDesc"
                        bind:checked={displaySettingsBindable.showUpcomingEventsTextAndDesc}
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <Label for="showEventName" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Event Name</span>
                        <span class="text-sm text-muted-foreground">Show the official event name with the image.</span>
                    </Label>
                    <input {...updateEventListForm.fields["displaySettings"]["showEventName"]?.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showEventName} type="checkbox" />
                    <Switch
                        id="showEventName"
                        bind:checked={displaySettingsBindable.showEventName}
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <Label for="showEventDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Event Description</span>
                        <span class="text-sm text-muted-foreground">Show the official event description IF one was applied for an event.</span>
                    </Label>
                    <input {...updateEventListForm.fields["displaySettings"]["showEventDescription"]?.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showEventDescription} type="checkbox" />
                    <Switch
                        id="showEventDescription"
                        bind:checked={displaySettingsBindable.showEventDescription}
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <Label for="showEventRegistration" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Register Button</span>
                        <span class="text-sm text-muted-foreground">If an event has a registration URL set, that link can be shown to the user.</span>
                    </Label>
                    <input {...updateEventListForm.fields["displaySettings"]["showEventRegistration"]?.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showEventRegistration} type="checkbox" />
                    <Switch
                        id="showEventRegistration"
                        bind:checked={displaySettingsBindable.showEventRegistration}
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <Label for="setTransparentBackground" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Transparent Background</span>
                        <span class="text-sm text-muted-foreground">Sets the background of the iframe window to transparent. But remember to set your iframe arguments to enable transparency.</span>
                    </Label>
                    <input {...updateEventListForm.fields["displaySettings"]["setTransparentBackground"]?.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.setTransparentBackground} type="checkbox" />
                    <Switch
                        id="setTransparentBackground"
                        bind:checked={displaySettingsBindable.setTransparentBackground}
                    />
                </div>
            {/if}
        </div>
    </Card.Content>
</Card.Root>