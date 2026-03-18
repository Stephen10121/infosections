<script lang="ts">
    import { BarChart3, ChevronDown, ExternalLink, Globe, Link2, ShieldAlert, ShieldOff, TriangleAlert } from "@lucide/svelte";
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import DynamicURLEditor from "./DynamicURLEditor.svelte";
    import { buttonVariants } from "@/components/ui/button";
    import { cn, type DynamicURLModel } from "@/utils.js";
    import * as Card from "@/components/ui/card/index";
    import { Badge } from "@/components/ui/badge";

    let { openId = $bindable(), url, websiteURL }: { openId: string | null, url: DynamicURLModel, websiteURL: string } = $props();

    function getStatusInfo(url: DynamicURLModel) {
        if (url.disableURL) return { label: "Disabled", variant: "destructive" as const, icon: ShieldOff }
        if (url.enableOverrideRedirect) return { label: "Override Active", variant: "secondary" as const, icon: ShieldAlert }
        if (url.enableWeekSheet) return { label: "Scheduled", variant: "default" as const, icon: Globe }
        return { label: "Default Only", variant: "outline" as const, icon: Globe }
    }

    function getTotalHits(url: DynamicURLModel) {
        return url.refs.reduce((sum, ref) => sum + ref.hits, 0)
    }

    function getTimeSlotCount(url: DynamicURLModel) {
        return url.weekSheet.reduce((sum, day) => sum + day.length, 0)
    }

    let status = $derived(getStatusInfo(url));
    let totalHits = $derived(getTotalHits(url));
    let slotCount = $derived(getTimeSlotCount(url));
    let isOpen = $derived(openId === url.id);

    let saveRequired = $state(false);
    let saveRequiredClosed = $state(false);

    $effect(() => {
        if (!saveRequired) saveRequiredClosed = false;
    });
</script>

<Collapsible.Root
    open={isOpen}
    onOpenChange={(open) => {
        openId = (open ? url.id : null);
        saveRequiredClosed = saveRequired ? true : false;
    }}
>
    <Card.Root
        class={cn(
            "transition-colors p-0 gap-0",
            isOpen && "ring-1 ring-primary/30",
            url.disableURL && "opacity-60",
            saveRequired && "outline-4 outline-ring/50",
            saveRequiredClosed && "outline-red-500/50"
        )}
    >
        <Collapsible.Trigger class={buttonVariants({ variant: "ghost", class: "h-full" })}>
            <div class="w-full flex items-center gap-4 p-4 text-left">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Link2 class="h-5 w-5 text-primary" />
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-foreground truncate">
                            /{url.id.replace("url_", "")}
                        </span>
                        <Badge variant={status.variant} class="text-xs shrink-0">
                            <status.icon class="h-3 w-3 mr-1" />
                            {status.label}
                        </Badge>
                        {#if saveRequiredClosed}
                            <Badge variant="destructive" class="text-xs shrink-0">
                                <TriangleAlert class="h-3 w-3 mr-1" />
                                Unsaved Changes
                            </Badge>
                        {/if}
                    </div>
                    <p class="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                        <ExternalLink class="h-3 w-3" />
                        {websiteURL}/go/{url.id}
                    </p>
                </div>

                <div class="hidden md:flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                    <div class="flex items-center gap-1.5" title="Total hits">
                        <BarChart3 class="h-4 w-4" />
                        <span>{totalHits.toLocaleString()}</span>
                    </div>
                    <div class="text-xs">
                        {slotCount} {slotCount === 1 ? "slot" : "slots"}
                    </div>
                    <div class="text-xs">{url.timeZone.toString().split("/")[1]?.replace(/_/g, " ")}</div>
                </div>
                <ChevronDown
                    class={cn(
                        "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                        isOpen && "rotate-180",
                    )}
                />
            </div>
        </Collapsible.Trigger>

        <Collapsible.Content>
            <div class="border-t border-border">
                <DynamicURLEditor url={url} bind:saveRequired />
            </div>
        </Collapsible.Content>
    </Card.Root>
</Collapsible.Root>