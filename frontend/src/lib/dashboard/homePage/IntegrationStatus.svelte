<script lang="ts">
    import { updateSpecificUserEvents } from "../../../routes/(mainWebsite)/dashboard/events.remote";
    import { AlertCircle, CheckCircle2, Cloud, RefreshCw } from "@lucide/svelte";
    import { timeAgo, timeWhen, type IntegrationModel } from "@/utils";
    import { type EventDBModelPrivate } from "@/event.utils";
    import * as Card from "@/components/ui/card/index";
    import { Button } from "@/components/ui/button";
    import { toast } from "svelte-sonner";

    let { myIntegrations, allUserEvents }: { myIntegrations: IntegrationModel[], allUserEvents: EventDBModelPrivate[] } = $props();

    let connectedCount = $derived(myIntegrations.filter(i => i.status === "connected").length);
    let totalEvents = $derived(allUserEvents.length);
    let mostRecentSync = $derived(myIntegrations.length > 0 
    ? myIntegrations.reduce((latest, i) => {
        const date = new Date(i.lastEventsFetch)
        return date > latest ? date : latest
      }, new Date(0))
    : new Date())

    let nextSync = $derived(timeWhen((new Date(mostRecentSync)).setHours(mostRecentSync.getHours() + 1)))

    const serviceColors: Record<string, string> = {
        planningcenter: "text-blue-400",
        breeze: "text-sky-400",
        google: "text-red-400",
        outlook: "text-blue-500",
        ical: "text-orange-400",
    }

    let isSyncing = $state(false);
    async function handleSyncAll() {
        isSyncing = true;
        const response = await updateSpecificUserEvents();
        isSyncing = false;
        if (response.error) {
            toast.error(response.msg);
        } else {
            toast.success(response.msg);
        }
    }
</script>

<Card.Root class="border-border/50 bg-card">
    <Card.Header class={myIntegrations.length > 0 ? 'pb-3' : ''}>
        <Card.Title class="text-base font-semibold text-foreground">Sync Status</Card.Title>
        <Card.Description class="text-xs">
            {connectedCount} integration{connectedCount !== 1 ? "s" : ""} connected
        </Card.Description>
    </Card.Header>
    {#if myIntegrations.length > 0}
        <Card.Content class="space-y-4">
            <div class="space-y-2">
                {#each myIntegrations as integration (`anIntegrationStatus${integration.id}`)}
                    {@const isConnected = integration.status === "connected"}
                    {@const isError = integration.status === "error"}
                    {@const isSyncingIntegration = integration.status === "syncing"}

                    <div class="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50">
                        <div class="flex items-center gap-2.5">
                            {#if isConnected}
                                <CheckCircle2 class="h-4 w-4 text-emerald-400" />
                            {:else if isError}
                                <AlertCircle class="h-4 w-4 text-destructive" />
                            {:else if isSyncingIntegration}
                                <RefreshCw class="h-4 w-4 text-amber-400 animate-spin" />
                            {:else}
                                <Cloud class={`h-4 w-4 ${serviceColors[integration.service]}`} />
                            {/if}
                            <div>
                                <p class="text-sm font-medium text-foreground">
                                    {integration.prettyName}
                                </p>
                                <p class="text-xs text-muted-foreground">
                                    {allUserEvents.filter((event) => event.service === integration.service).length} events &middot; {timeAgo(new Date(integration.lastEventsFetch))}
                                </p>
                            </div>
                        </div>

                        <div class="text-xs px-2 py-0.5 rounded-full {
                            isConnected ? "bg-emerald-400/10 text-emerald-400" :
                            isError ? "bg-destructive/10 text-destructive" :
                            "bg-amber-400/10 text-amber-400"
                        }">
                            {#if isConnected}
                                Synced
                            {:else if isError}
                                Error
                            {:else}
                                Syncing
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-secondary/50 text-center">
                    <p class="text-xs text-muted-foreground">Total events</p>
                    <p class="text-lg font-semibold text-foreground">{totalEvents}</p>
                </div>
                <div class="p-3 rounded-lg bg-secondary/50 text-center">
                    <p class="text-xs text-muted-foreground">Next sync</p>
                    <p class="text-lg font-semibold text-foreground">{nextSync}</p>
                </div>
            </div>

            <Button
                variant="outline"
                class="w-full border-border/50 hover:bg-secondary"
                onclick={handleSyncAll}
                disabled={isSyncing}
            >
                <RefreshCw class="h-4 w-4 mr-2 {isSyncing ? "animate-spin" : ""}" />
                {isSyncing ? "Syncing all..." : "Sync All"}
            </Button>
        </Card.Content>
    {/if}
</Card.Root>