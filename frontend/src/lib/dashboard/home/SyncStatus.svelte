<script lang="ts">
    import { Button } from "@/components/ui/button";
    import * as Card from "@/components/ui/card/index";
    import { refreshingEvents, timeAgo, timeWhen } from "@/utils";
    import { RefreshCw, CheckCircle2 } from "@lucide/svelte";
    import { onMount } from "svelte";

    let { lastEventsFetch, eventsAmount }: { lastEventsFetch: string, eventsAmount: number } = $props();

    let lastFetchDate = $derived(new Date(lastEventsFetch));

    let nextFetchDate = $derived((new Date(lastEventsFetch)).setHours(lastFetchDate.getHours() + 1));

    let lastSyncTAgo = $derived(timeAgo(lastEventsFetch));
    let lastSyncTIn = $derived(timeWhen(nextFetchDate));

    onMount(() => {
        const clearTimer = setInterval(() => {
            lastSyncTAgo = timeAgo(lastEventsFetch);
            lastSyncTIn = timeWhen(nextFetchDate);
        });

        return () => {
            clearInterval(clearTimer);
        }
    });
</script>

<Card.Root>
    <Card.Header>
    <Card.Title class="text-base font-medium">Sync Status</Card.Title>
    <Card.Description>Planning Center connection</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
    <div class="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 class="h-5 w-5 text-emerald-500" />
        <div class="flex-1">
        <p class="text-sm font-medium text-emerald-500">Connected</p>
        <p class="text-xs text-muted-foreground">Last sync: {lastSyncTAgo}</p>
        </div>
    </div>

    <div class="space-y-2 text-sm">
        <div class="flex justify-between">
        <span class="text-muted-foreground">Events fetched</span>
        <span class="font-medium">{eventsAmount}</span>
        </div>
        <div class="flex justify-between">
        <span class="text-muted-foreground">Next sync</span>
        <span class="font-medium">In {lastSyncTIn}</span>
        </div>
    </div>

    <Button variant="outline" class="w-full gap-2 bg-transparent" onclick={refreshingEvents}>
        <RefreshCw class="h-4 w-4" />
        Sync Now
    </Button>
    </Card.Content>
</Card.Root>