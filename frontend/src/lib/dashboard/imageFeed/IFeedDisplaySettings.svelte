<script lang="ts">
    import { updateImageFeedForm } from "../../../routes/(mainWebsite)/dashboard/image-feeds/imageFeedActions.remote";
    import type { ImageFeedCustomizations } from "@/utils";
    import * as Card from "@/components/ui/card/index";
    import { Switch } from "@/components/ui/switch";
    import { Label } from "@/components/ui/label";
    import { Input } from "@/components/ui/input";

    let {
        displaySettings,
        displaySettingsPreview = $bindable(),
        changed = $bindable()
    }: {
        displaySettings: ImageFeedCustomizations,
        displaySettingsPreview: ImageFeedCustomizations,
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
            <div class="flex items-center justify-between space-x-2">
                <Label for="showEventExtraInfo" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Display Extra Event Information</span>
                    <span class="text-sm text-muted-foreground">If a description of an event was set, you can choose if you want to display that info.</span>
                </Label>
                <input {...updateImageFeedForm.fields.displaySettings.showEventExtraInfo.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showEventExtraInfo} type="checkbox" />
                <Switch
                    id="showEventExtraInfo"
                    bind:checked={displaySettingsBindable.showEventExtraInfo}
                />
            </div>

            {#if displaySettingsBindable.showEventExtraInfo}
                <div class="flex items-center justify-between space-x-2 ml-5">
                    <Label for="showEventName" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Event Name</span>
                        <span class="text-sm text-muted-foreground">Show the official event name with the image.</span>
                    </Label>
                    <input {...updateImageFeedForm.fields.displaySettings.showEventName.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showEventName} type="checkbox" />
                    <Switch
                        id="showEventName"
                        bind:checked={displaySettingsBindable.showEventName}
                    />
                </div>
                <div class="flex items-center justify-between space-x-2 ml-5">
                    <Label for="showEventDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Event Description</span>
                        <span class="text-sm text-muted-foreground">Show the official event description IF one was applied for an event.</span>
                    </Label>
                    <input {...updateImageFeedForm.fields.displaySettings.showEventDescription.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showEventDescription} type="checkbox" />
                    <Switch
                        id="showEventDescription"
                        bind:checked={displaySettingsBindable.showEventDescription}
                    />
                </div>
                <div class="flex items-center justify-between space-x-2 ml-5">
                    <Label for="showEventRegistration" class="flex flex-col items-start space-y-1 cursor-pointer">
                        <span class="font-medium">Register Button</span>
                        <span class="text-sm text-muted-foreground">If an event has a registration URL set, that link can be shown to the user.</span>
                    </Label>
                    <input {...updateImageFeedForm.fields.displaySettings.showEventRegistration.as("checkbox")} class="sr-only" bind:checked={displaySettingsBindable.showEventRegistration} type="checkbox" />
                    <Switch
                        id="showEventRegistration"
                        bind:checked={displaySettingsBindable.showEventRegistration}
                    />
                </div>
            {/if}

            <div class="space-y-2">
                <input class="sr-only" {...updateImageFeedForm.fields.displaySettings.feedDurationMS.as("number")} bind:value={displaySettingsBindable.feedDurationMS} />
                <Label for="feedDurationMS" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Slideshow Duration</span>
                    <span class="text-sm text-muted-foreground">How long you want to show each slide in milliseconds.</span>
                </Label>
                <Input
                    id="feedDurationMS"
                    type="number"
                    bind:value={displaySettingsBindable.feedDurationMS}
                />
            </div>
        </div>
    </Card.Content>
</Card.Root>