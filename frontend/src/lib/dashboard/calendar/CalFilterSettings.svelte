<script lang="ts">
    import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Card from "@/components/ui/card/index";
    import type { CalendarFilters } from "@/cal.utils";
    import { Switch } from "@/components/ui/switch";
    import { Label } from "@/components/ui/label";
    import { getMyEventResourcesPrivate } from "../../../routes/(mainWebsite)/dashboard/events.remote";
    import * as Item from "$lib/components/ui/item/index.js";

    let {
        filters,
        changed = $bindable()
    }: {
        filters: CalendarFilters,
        changed: boolean
    } = $props();

    let myResources = $derived(await getMyEventResourcesPrivate());

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

            <div>
                <div class="flex items-center justify-between">
                    <Label class="flex flex-col items-start space-y-1 cursor-pointer" for="enableResourceFiltering">
                        <span class="font-medium">Enable Resource Filtering</span>
                        <span class="text-sm text-muted-foreground">Most events contain information regarding the resources that are required. You can allow or block events based on its resource requirements.</span>
                    </Label>

                    <input {...updateCalendarForm.fields.filters.enableResourceFiltering.as("checkbox")} class="sr-only" bind:checked={filtersBindable.enableResourceFiltering} type="checkbox" />
                    <Switch
                        id="enableResourceFiltering"
                        bind:checked={filtersBindable.enableResourceFiltering}
                    />
                </div>

                <div>
                    <input {...updateCalendarForm.fields.filters.resourceFilterType.as("hidden", filtersBindable.resourceFilterType)} />
                    <Tabs.Root bind:value={filtersBindable.resourceFilterType} class="w-full mt-2">
                        <Tabs.List class="w-full rounded-b-none">
                            <Tabs.Trigger value="allow" disabled={!filtersBindable.enableResourceFiltering}>Allow Events</Tabs.Trigger>
                            <Tabs.Trigger value="block" disabled={!filtersBindable.enableResourceFiltering}>Block Events</Tabs.Trigger>
                        </Tabs.List>
                    </Tabs.Root>
                    <div class="w-full bg-muted rounded-b-md p-2 {filtersBindable.resourceFilterType === "block" ? "hidden" : "mt-0.5"}">
                        <Label class="flex flex-col items-start space-y-0.5">
                            <span class="text-sm text-muted-foreground">Allow events that contain this resource.</span>
                        </Label>
                        <div class="space-y-2 mt-2">
                            {#each myResources as resource (`allowAResource${resource.id}`)}
                                <div class="flex items-center gap-3">
                                    <Label for="allowResource{resource.id}" class="w-full {!filtersBindable.enableResourceFiltering ? "opacity-50" : ""}">
                                        <Item.Root variant="outline">
                                            <Item.Content>
                                                <Item.Title>{resource.name}{#if resource.path_name}<span class="-ml-1">({resource.path_name.trimEnd()})</span>{/if}</Item.Title>
                                                {#if resource.description}
                                                    <Item.Description>{resource.description}</Item.Description>
                                                {/if}
                                            </Item.Content>
                                            <Item.Actions>
                                                <input disabled={!filtersBindable.enableResourceFiltering} id="allowResource{resource.id}" {...updateCalendarForm.fields.filters.allowResources.as("checkbox", resource.id)} bind:group={filtersBindable.allowResources} />
                                            </Item.Actions>
                                        </Item.Root>
                                    </Label>
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div class="w-full bg-muted rounded-b-md p-2 {filtersBindable.resourceFilterType === "allow" ? "hidden" : "mt-0.5"}">
                        <Label class="flex flex-col items-start space-y-0.5">
                            <span class="text-sm text-muted-foreground">Block events that contain this resource.</span>
                        </Label>
                        <div class="space-y-2 mt-2">
                            {#each myResources as resource (`blockAResource${resource.id}`)}
                                <div class="flex items-center gap-3">
                                    <Label for="blockResource{resource.id}" class="w-full {!filtersBindable.enableResourceFiltering ? "opacity-50" : ""}">
                                        <Item.Root variant="outline">
                                            <Item.Content>
                                                <Item.Title>{resource.name}{#if resource.path_name}<span class="-ml-1">({resource.path_name.trimEnd()})</span>{/if}</Item.Title>
                                                {#if resource.description}
                                                    <Item.Description>{resource.description}</Item.Description>
                                                {/if}
                                            </Item.Content>
                                            <Item.Actions>
                                                <input disabled={!filtersBindable.enableResourceFiltering} id="blockResource{resource.id}" {...updateCalendarForm.fields.filters.blockResources.as("checkbox", resource.id)} bind:group={filtersBindable.blockResources} />
                                            </Item.Actions>
                                        </Item.Root>
                                    </Label>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Card.Content>
</Card.Root>