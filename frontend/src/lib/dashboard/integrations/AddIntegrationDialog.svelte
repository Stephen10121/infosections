<script lang="ts">
    import { addAnIntegration } from "../../../routes/(mainWebsite)/dashboard/integrations.remote";
    import { getMyIntegrations } from "../../../routes/(mainWebsite)/dashboard/backend.remote";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import IntegrationIcon from "./IntegrationIcon.svelte";
    import { availableIntegrations, cn } from "@/utils";
    import { Badge } from "@/components/ui/badge";
    import { toast } from "svelte-sonner";

    let { open = $bindable() }: { open: boolean } = $props();
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
            <form {...addAnIntegration.for(`anavailableintegration${integration.id}`).enhance(async ({ submit }) => {
                let loading = toast.loading("Adding Integration", { duration: Number.POSITIVE_INFINITY });
                await submit();
                toast.dismiss(loading);
            })}>
                <input {...addAnIntegration.fields.provider.as("hidden", integration.id)} />
                <button
                    disabled={isConnected || integration.comingSoon}
                    onclick={() => {
                        open = false;
                    }}
                    type="submit"
                    class={cn(
                        "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        isConnected || integration.comingSoon
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
                            {:else if integration.comingSoon}
                                <Badge variant="secondary" class="text-[10px]">Coming Soon</Badge>
                            {/if}
                        </div>
                        <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {integration.description}
                        </p>
                    </div>
                </button>
            </form>
        {/each}
    </div>
    </Dialog.Content>
</Dialog.Root>