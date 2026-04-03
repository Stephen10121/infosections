<script lang="ts">
    import { removeAnIntegration } from "../../../routes/(mainWebsite)/dashboard/integrations.remote";
    import { getMyIntegrations } from "../../../routes/(mainWebsite)/dashboard/backend.remote";
    import { refreshingEvents, timeWhen, type IntegrationModel } from "@/utils";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Loader2, RefreshCw, Trash2 } from "@lucide/svelte";
    import IntegrationIcon from "./IntegrationIcon.svelte";
    import { Button } from "@/components/ui/button";
    import StatusBadge from "./StatusBadge.svelte";
    import { toast } from "svelte-sonner";

    let { integration = $bindable() }: { integration: IntegrationModel | null } = $props();

    async function handleSync() {
        if (integration?.service === "planningcenter") {
            await refreshingEvents();
            const myIntegrations = (await getMyIntegrations()).filter((int) => int.service === "planningcenter")
            integration = myIntegrations.length > 0 ? myIntegrations[0] ? myIntegrations[0] : null : null;
        }
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
                    <span class="text-sm text-muted-foreground">Next sync event</span>
                    <span class="text-sm">{timeWhen((new Date(integration.lastEventsFetch)).setHours((new Date(integration.lastEventsFetch)).getHours() + 1))}</span>
                </div>
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
                </div>
                <form {...removeAnIntegration.enhance(async ({ submit }) => {
                    let loading = toast.loading("Removing Integration.", { duration: Number.POSITIVE_INFINITY });
                    await submit();
                    integration = null;
                    toast.dismiss(loading);
                })}>
                    <input {...removeAnIntegration.fields.id.as("hidden", integration.id)} />
                    <Button
                        variant="destructive"
                        class="w-full"
                        type="submit"
                    >
                        <Trash2 class="mr-2 h-4 w-4" />
                        Remove Integration
                    </Button>
                </form>
            </Dialog.Footer>
        </Dialog.Content>
    {/if}
</Dialog.Root>