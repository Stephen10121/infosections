<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { availableIntegrations, cn, type AvailableIntegration } from "@/utils";
    import { getMyIntegrations } from "../../../routes/(mainWebsite)/dashboard/backend.remote";
    import IntegrationIcon from "./IntegrationIcon.svelte";
    import { Badge } from "@/components/ui/badge";

    let { open = $bindable() }: { open: boolean } = $props();

    function addIntegration(integration: AvailableIntegration) {
        console.log(integration);
    }
</script>

<Dialog.Root bind:open={open}>
    <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
        <Dialog.Title>Add Integration</Dialog.Title>
        <Dialog.Description>Connect a new service to sync events automatically.</Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-3 py-4">
        {#each availableIntegrations as integration (`anavailableintegration${integration.id}`)}
            {@const isConnected = (await getMyIntegrations()).filter((int) => int.service === integration.id).length > 0}
            <button
                disabled={isConnected}
                onclick={() => {
                    addIntegration(integration)
                    open = false;
                }}
                class={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    isConnected
                    ? "opacity-50 cursor-not-allowed bg-muted/50"
                    : "hover:bg-accent hover:border-accent-foreground/20 cursor-pointer"
                )}
            >
                <IntegrationIcon icon={integration.icon} class="h-10 w-10 shrink-0" />
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-sm">{integration.name}</span>
                        {#if isConnected}
                            <Badge variant="secondary" class="text-[10px]">Connected</Badge>
                        {/if}
                    </div>
                    <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {integration.description}
                    </p>
                </div>
            </button>
        {/each}
    </div>
    </Dialog.Content>
</Dialog.Root>