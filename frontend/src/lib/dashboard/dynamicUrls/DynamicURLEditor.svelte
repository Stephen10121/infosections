<script lang="ts">
    import { deleteDynamicURL } from "@/endpointCalls/dynamicUrl/deleteDynamicURL";
    import { updateDynamicURL } from "@/endpointCalls/dynamicUrl/updateDynamicURL";
    import { cn, TIMEZONES, type DynamicURLModel } from "@/utils.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { AlertTriangle, Trash2 } from "@lucide/svelte";
    import WeekSheetGrid from "./WeekSheetGrid.svelte";
    import * as Card from "@/components/ui/card/index";
    import { Button } from "@/components/ui/button";
    import { invalidateAll } from "$app/navigation";
    import { Badge } from "@/components/ui/badge";
    import { toast } from "svelte-sonner";

    async function deleteIt() {
        const loading = toast.loading("Deleting Dynamic URL");
        const success = await deleteDynamicURL(
            url.id,
        );
        toast.dismiss(loading);
        if (success) {
            invalidateAll();
        }
    }

    let { url, saveRequired = $bindable() }: { url: DynamicURLModel, saveRequired: boolean } = $props();

    let confirmDelete = $state(false);
    let totalHits = $derived(url.refs.reduce((sum, ref) => sum + ref.hits, 0));
    let maxHits = $derived(Math.max(...url.refs.map((r) => r.hits), 1));

    let defaultRedirectURL = $derived(url.defaultRedirectTo);
    let currentTz = $derived(url.timeZone.toString());
    let disableURL = $derived(url.disableURL);
    let enableOverride = $derived(url.enableOverrideRedirect);
    let overrideURL = $derived(url.overrideRedirectTo);
    let enableWeeklySchedule = $derived(url.enableWeekSheet);
    let weekSheet = $derived(url.weekSheet);

    $effect(() => {
        const defaultRedirectURLChanged = defaultRedirectURL !== url.defaultRedirectTo;
        const currentTzChanged = currentTz !== url.timeZone.toString();
        const disableURLChanged = disableURL !== url.disableURL;
        const enableOverrideChanged = enableOverride !== url.enableOverrideRedirect;
        const overrideURLChanged = overrideURL !== url.overrideRedirectTo;
        const enableWeeklyScheduleChanged = enableWeeklySchedule !== url.enableWeekSheet;
        const weekSheetChanged = weekSheet !== url.weekSheet;

        saveRequired = defaultRedirectURLChanged ||
            currentTzChanged ||
            disableURLChanged ||
            enableOverrideChanged ||
            ( enableOverride && overrideURLChanged ) ||
            enableWeeklyScheduleChanged ||
            weekSheetChanged;
    });

    async function update() {
        const loading = toast.loading("Updating Dynamic URL");
        const success = await updateDynamicURL(
            url.id,
            defaultRedirectURL,
            currentTz,
            weekSheet,
            enableWeeklySchedule,
            overrideURL,
            enableOverride,
            disableURL
        );
        toast.dismiss(loading);
        if (success) {
            invalidateAll();
        }
    }
</script>

<div class="p-4 lg:p-6 space-y-8 relative">
    {#if saveRequired}
        <Card.Root class="sticky top-1 z-40 rounded">
            <Card.Header>
                <Card.Title>Save Changes?</Card.Title>
                <Card.Description>All the changes you made are not yet saved.</Card.Description>
                <Card.Action>
                    <Button onclick={update}>Save</Button>
                </Card.Action>
            </Card.Header>
        </Card.Root>
    {/if}
    <section class="space-y-4">
        <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider">General Settings</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <Label for={`default-${url.id}`}>Default Redirect URL</Label>
                <Input
                    id={`default-${url.id}`}
                    bind:value={defaultRedirectURL}
                    placeholder="https://example.com/fallback"
                />
                <p class="text-xs text-muted-foreground">Where visitors go when no schedule or override matches.</p>
            </div>
            <div class="space-y-2">
                <Label for={`tz-${url.id}`}>Timezone</Label>
                <Select.Root type="single" bind:value={currentTz} >
                    <Select.Trigger id={`tz-${url.id}`}>
                    {currentTz}
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

        <div class="flex items-center justify-between rounded-lg border border-border p-4">
            <div class="space-y-0.5">
                <Label for={`disable-${url.id}`} class="font-medium">
                    Disable URL
                </Label>
                <p class="text-xs text-muted-foreground">
                    When disabled, visitors will see a 404 page instead of being redirected.
                </p>
            </div>
            <Switch
                id={`disable-${url.id}`}
                checked={url.disableURL}
                onCheckedChange={(checked) => disableURL = checked}
            />
        </div>
    </section>

    <section class="space-y-4">
        <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider">Override Redirect</h3>
        <div class="rounded-lg border border-border p-4 space-y-4">
            <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                    <Label for={`override-toggle-${url.id}`} class="font-medium">
                        Enable Override
                    </Label>
                    <p class="text-xs text-muted-foreground">
                        When enabled, all visitors are sent to the override URL regardless of schedule.
                    </p>
                </div>
                <Switch
                    id={`override-toggle-${url.id}`}
                    checked={url.enableOverrideRedirect}
                    onCheckedChange={(checked) => enableOverride = checked}
                />
            </div>
            {#if enableOverride}
                <div class="space-y-2">
                    <Label for={`override-url-${url.id}`}>Override URL</Label>
                    <Input
                        required
                        id={`override-url-${url.id}`}
                        bind:value={overrideURL}
                        placeholder="https://zoom.us/j/special-event"
                    />
                </div>
            {/if}
        </div>
    </section>

    <section class="space-y-4">
        <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider">Weekly Schedule</h3>
        <div class="rounded-lg border border-border p-4 space-y-4">
            <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                    <Label for={`week-toggle-${url.id}`} class="font-medium">
                        Enable Weekly Schedule
                    </Label>
                    <p class="text-xs text-muted-foreground">
                        Redirect to different URLs based on day and time of the week.
                    </p>
                </div>
                <Switch
                    id={`week-toggle-${url.id}`}
                    checked={url.enableWeekSheet}
                    onCheckedChange={(checked) => enableWeeklySchedule = checked}
                />
            </div>
            {#if enableWeeklySchedule}
                <WeekSheetGrid
                    weekSheet={weekSheet}
                    onchange={(newWeekSheet) => {
                        weekSheet = newWeekSheet;
                    }}
                />
            {/if}
        </div>
    </section>

    {#if url.refs.length > 0}
        <section class="space-y-4">
            <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider">
                Referral Tracking
            </h3>
            <div class="rounded-lg border border-border overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Source</Table.Head>
                            <Table.Head class="w-24 text-right">Hits</Table.Head>
                            <Table.Head class="hidden sm:table-cell">Distribution</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each url.refs.sort((a, b) => b.hits - a.hits) as ref (`aref${ref.name}`)}
                            <Table.Row>
                                <Table.Cell>
                                    <Badge variant="outline" class="font-mono text-xs">
                                        ?ref={ref.name}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell class="text-right font-medium tabular-nums">
                                    {ref.hits.toLocaleString()}
                                </Table.Cell>
                                <Table.Cell class="hidden sm:table-cell">
                                    <div class="flex items-center gap-2">
                                        <div class="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                                            <div
                                                class="h-full rounded-full bg-primary transition-all"
                                                style="width: {(ref.hits / maxHits) * 100}%;"
                                            ></div>
                                        </div>
                                        <span class="text-xs text-muted-foreground w-10 text-right tabular-nums">
                                            {totalHits > 0 ? Math.round((ref.hits / totalHits) * 100) : 0}%
                                        </span>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>
        </section>
    {/if}

    <section class="space-y-4">
        <h3 class="text-sm font-semibold text-destructive uppercase tracking-wider">
            Danger Zone
        </h3>
        <div
            class={cn(
            "rounded-lg border p-4 flex items-center justify-between",
            confirmDelete ? "border-destructive/50 bg-destructive/5" : "border-border",
            )}
        >
            <div class="space-y-0.5">
                <p class="text-sm font-medium text-foreground">Delete this Dynamic URL</p>
                <p class="text-xs text-muted-foreground">
                    This action cannot be undone. All referral tracking data will be lost.
                </p>
            </div>
            {#if confirmDelete}
                <div class="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onclick={() => confirmDelete = false}>
                        Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onclick={deleteIt} class="gap-1.5">
                        <AlertTriangle class="h-3.5 w-3.5" />
                        Confirm Delete
                    </Button>
                </div>
            {:else}
                <Button
                    variant="destructive"
                    size="sm"
                    onclick={() => confirmDelete = true}
                    class="gap-1.5 shrink-0"
                >
                    <Trash2 class="h-3.5 w-3.5" />
                    Delete
                </Button>
            {/if}
        </div>
    </section>
</div>