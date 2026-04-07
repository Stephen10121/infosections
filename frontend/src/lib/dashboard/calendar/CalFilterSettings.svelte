<script lang="ts">
    import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Card from "@/components/ui/card/index";
    import type { CalendarFilters } from "@/cal.utils";
    import { Switch } from "@/components/ui/switch";
    import { Label } from "@/components/ui/label";

    let {
        filters,
        changed = $bindable()
    }: {
        filters: CalendarFilters,
        changed: boolean
    } = $props();

    // svelte-ignore state_referenced_locally
    let filtersBindable = $state(filters);
    $effect(() => {filtersBindable = filters});

    $effect(() => {
        changed = JSON.stringify(filtersBindable) !== JSON.stringify(filters);
    });
</script>

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

                <input {...updateCalendarForm.fields.filters.onlyShowFeatured.as("checkbox")} class="sr-only" bind:checked={filtersBindable.onlyShowFeatured} type="checkbox" />
                <Switch
                    id="onlyShowFeatured"
                    bind:checked={filtersBindable.onlyShowFeatured}
                />
            </div>

            <div class="flex items-center justify-between space-x-2">
                <Label for="hideUnpublished" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Hide Unpublished Events</span>
                    <span class="text-sm text-muted-foreground">Hide the events that are not visible in the church center.</span>
                </Label>

                <input {...updateCalendarForm.fields.filters.hideUnpublished.as("checkbox")} class="sr-only" bind:checked={filtersBindable.hideUnpublished} type="checkbox" />
                <Switch
                    id="hideUnpublished"
                    bind:checked={filtersBindable.hideUnpublished}
                />
            </div>

            <div class="flex items-center justify-between flex-col space-y-2">
                <Label for="showDescription" class="flex flex-col items-start space-y-1 cursor-pointer">
                    <span class="font-medium">Resource Filtering Type</span>
                    <span class="text-sm text-muted-foreground">You can either choose a block list or allowlist for resource filtering. Block or allow as many resources.</span>
                </Label>
                <input {...updateCalendarForm.fields.filters.resourceFilterType.as("hidden", filtersBindable.resourceFilterType)} />
                <Tabs.Root bind:value={filtersBindable.resourceFilterType} class="w-full">
                    <Tabs.List class="w-full">
                        <Tabs.Trigger value="allow">AllowList</Tabs.Trigger>
                        <Tabs.Trigger value="block">BlockList</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="allow">
                        allow
                    </Tabs.Content>
                    <Tabs.Content value="block">
                        block
                    </Tabs.Content>
                </Tabs.Root>
            </div>
        </div>
    </Card.Content>
</Card.Root>