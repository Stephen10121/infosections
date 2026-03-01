<script lang="ts">
    import SingleDynamicURL from "@/dashboard/dynamicUrls/SingleDynamicURL.svelte";
    import { TIMEZONES, type DynamicURLModel } from "@/utils.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Spinner } from "@/components/ui/spinner/index.js";
    import { createDynamicURLCommand } from "./data.remote.js";
    import { Label } from "@/components/ui/label/index.js";
    import { Input } from "@/components/ui/input/index.js";
    import * as Dialog from "@/components/ui/dialog/index";
    import * as Card from "@/components/ui/card/index";
    import { Button } from "@/components/ui/button";
    import { invalidateAll } from "$app/navigation";
    import { Link2, Plus } from "@lucide/svelte";
    import { Temporal } from "temporal-polyfill";
    import { toast } from "svelte-sonner";

    function getTotalHits(url: DynamicURLModel) {
        return url.refs.reduce((sum, ref) => sum + ref.hits, 0)
    }

    function getTimeSlotCount(url: DynamicURLModel) {
        return url.weekSheet.reduce((sum, day) => sum + day.length, 0)
    }

    let { data } = $props();
    let openId: string | null = $state(null);
    let newDynamicURLOpen = $state(false);

    let newDynamicURLID = $state("");
    let newDynamicURLDefaultRedirectTo = $state("");
    let timeZone = $state(Temporal.Now.timeZoneId());

    let creatingDynamicURL = $state(false);

    function handleCreate() {
        newDynamicURLOpen = true;
    }

    async function handleCreateDynamicURL() {
        if (newDynamicURLID && newDynamicURLDefaultRedirectTo) {
            creatingDynamicURL = true;
            try {
                const response = await createDynamicURLCommand({
                    id: newDynamicURLID,
                    defaultRedirectTo: newDynamicURLDefaultRedirectTo,
                    timeZone: timeZone
                });
                creatingDynamicURL = false;
                if (response.error) {
                    toast.error(response.msg);
                } else {
                    toast.success(response.msg);
                    newDynamicURLOpen = false;
                    newDynamicURLID = "";
                    newDynamicURLDefaultRedirectTo = "";
                    timeZone = Temporal.Now.timeZoneId();

                    let updating = toast.info("Updating Dynamic URL List");
                    await invalidateAll();
                    toast.dismiss(updating);
                }
            } catch (err) {
                creatingDynamicURL = false;
                console.log("errrrrr", err);
                toast.error("An error has occured.");
            }
        } else {
            toast.error("Missing Fields.");
        }
    }
</script>

<svelte:head>
    <title>My Dynamic URLs | InfoSections</title>
</svelte:head>


<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-foreground">My Dynamic URLs</h1>
            <p class="text-sm text-muted-foreground mt-1">
                Create smart redirects that change based on time of day and day of week.
            </p>
        </div>
        <Button onclick={handleCreate} class="gap-2">
            <Plus class="h-4 w-4" />
            New Dynamic URL
        </Button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card.Root class="p-4">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total URLs</p>
            <p class="text-2xl font-semibold text-foreground mt-1">{data.dynamic_urls.length}</p>
        </Card.Root>
        <Card.Root class="p-4">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
            <p class="text-2xl font-semibold text-foreground mt-1">
                {data.dynamic_urls.filter((u) => !u.disableURL).length}
            </p>
        </Card.Root>
        <Card.Root class="p-4">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Hits</p>
            <p class="text-2xl font-semibold text-foreground mt-1">
                {data.dynamic_urls.reduce((sum, u) => sum + getTotalHits(u), 0).toLocaleString()}
            </p>
        </Card.Root>
        <Card.Root class="p-4">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Slots</p>
            <p class="text-2xl font-semibold text-foreground mt-1">
                {data.dynamic_urls.reduce((sum, u) => sum + getTimeSlotCount(u), 0)}
            </p>
        </Card.Root>
    </div>

    <div class="space-y-3">
        {#each data.dynamic_urls as dynamic_url (`aDynamicURL${dynamic_url.id}`)}
            <SingleDynamicURL bind:openId={openId} url={dynamic_url} websiteURL={data.websiteURL} />
        {/each}

        {#if data.dynamic_urls.length === 0}
            <Card.Root class="p-12 text-center">
                <Link2 class="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 class="text-lg font-medium text-foreground">No dynamic URLs yet</h3>
                <p class="text-sm text-muted-foreground mt-1">
                    Create your first smart redirect to get started.
                </p>
                <Button onclick={handleCreate} class="mt-4 gap-2">
                    <Plus class="h-4 w-4" />
                    Create Dynamic URL
                </Button>
            </Card.Root>
        {/if}
    </div>
</div>

<Dialog.Root bind:open={newDynamicURLOpen}>
    <Dialog.Content class="sm:max-w-[500px]">
        <Dialog.Header>
        <Dialog.Title>Create New Dynamic URL</Dialog.Title>
            <Dialog.Description>You can change more settings after creating the URL.</Dialog.Description>
        </Dialog.Header>

        <div class="space-y-4 py-4">
            <div class="space-y-2">
                <Label for="id">URL ID</Label>
                <Input
                    id="id"
                    placeholder="e.g., donate"
                    bind:value={newDynamicURLID}
                />
            </div>

            <div class="space-y-2">
                <Label for="defaulturl">Default Redirect URL</Label>
                <Input
                    id="defaulturl"
                    type="url"
                    bind:value={newDynamicURLDefaultRedirectTo}
                    placeholder="https://example.com/donate"
                />
                <p class="text-xs text-muted-foreground">Where visitors go when no schedule or override matches.</p>
            </div>

            <div class="space-y-2">
                <Label for="tznew">Timezone</Label>
                <Select.Root type="single" bind:value={timeZone} >
                    <Select.Trigger id="tznew">
                    {timeZone}
                    </Select.Trigger>
                    <Select.Content>
                    {#each TIMEZONES as tz (`aTZ${tz}`)}
                        <Select.Item value={tz}>
                            {tz.replace(/_/g, " ")}
                        </Select.Item>
                    {/each}
                    </Select.Content>
                </Select.Root>
                <p class="text-xs text-muted-foreground">Schedule times are evaluated in this timezone.</p>
            </div>
        </div>

        <Dialog.Footer>
        <Button variant="outline" onclick={() => newDynamicURLOpen = false}>
            Cancel
        </Button>
        <Button onclick={handleCreateDynamicURL}>
            {#if creatingDynamicURL}
                <Spinner />
                Creating Dynamic URL...
            {:else}
                Create Dynamic URL
            {/if}
        </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>