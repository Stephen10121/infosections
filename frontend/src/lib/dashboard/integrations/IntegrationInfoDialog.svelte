<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { availableIntegrations, timeAgo, type IntegrationModel } from "@/utils";
    import IntegrationIcon from "./IntegrationIcon.svelte";
    import StatusBadge from "./StatusBadge.svelte";
    import { Button } from "@/components/ui/button";
    import { ExternalLink, Loader2, RefreshCw, Trash2 } from "@lucide/svelte";

    let { integration = $bindable() }: { integration: IntegrationModel | null } = $props();

    function handleSync() {

    }

    function removeIntegration() {

    }

    let syncing = $state(false);
</script>

<Dialog.Root open={integration !== null} onOpenChange={(open) => {
    if (!open) integration = null;
}}>
    {#if integration}
        <Dialog.Content class="sm:max-w-md">
            <Dialog.Header>
                <div class="flex items-center gap-3">
                    <IntegrationIcon icon={integration.service} class="h-10 w-10" />
                    <div>
                        <Dialog.Title>{integration.prettyName}</Dialog.Title>
                        <Dialog.Description class="mt-0.5">Manage your {integration.prettyName} integration</Dialog.Description>
                    </div>
                </div>
            </Dialog.Header>

            <div class="space-y-4 py-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Status</span>
                    <StatusBadge status={integration.status} />
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Last synced</span>
                    <span class="text-sm">{timeAgo(new Date(integration.lastEventsFetch))}</span>
                </div>

                {#if integration.eventsCount !== undefined}
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-muted-foreground">Events imported</span>
                        <span class="text-sm font-medium">{integration.eventsCount}</span>
                    </div>
                {/if}
            </div>

            <Dialog.Footer class="flex-col gap-2 sm:flex-col">
                <div class="flex gap-2 w-full">
                <Button
                    variant="outline"
                    class="flex-1"
                    onclick={handleSync}
                    disabled={syncing}
                >
                    {#if syncing}
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    {:else}
                        <RefreshCw class="mr-2 h-4 w-4" />
                    {/if}
                    Sync Now
                </Button>
                <Button variant="outline" class="flex-1">
                    <a
                        href={availableIntegrations.find((i) => {
                            if (integration) {
                                return i.slug === integration.slug
                            }
                            return false;
                        })?.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex"
                    >
                        <ExternalLink class="mr-2 h-4 w-4" />
                        View Docs
                    </a>
                </Button>
                </div>
                <Button
                    variant="destructive"
                    class="w-full"
                    onclick={removeIntegration}
                >
                    <Trash2 class="mr-2 h-4 w-4" />
                    Remove Integration
                </Button>
            </Dialog.Footer>
        </Dialog.Content>
    {/if}
</Dialog.Root>