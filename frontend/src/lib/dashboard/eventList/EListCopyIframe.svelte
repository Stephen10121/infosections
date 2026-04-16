<script lang="ts">
    import { AlertTriangle, Check, Code, Copy, OctagonAlert } from "@lucide/svelte";
    import { Button, buttonVariants } from "@/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { cn, generateIframeCode } from "@/utils";
    import { Label } from "@/components/ui/label";
    import { toast } from "svelte-sonner";

    let {
        listId,
        listName,
        infosectionsLink
    }: {
        listId: string,
        listName: string,
        infosectionsLink: string
    } = $props();

    let iframeCopied = $state(false);
    let iframeDialogOpen = $state(false);

    function copyIframeCode() {
        const link = generateIframeCode(`${infosectionsLink}/elist/${listId}`, `Infosections List | ${listName}`, listId, infosectionsLink);
        navigator.clipboard.writeText(link);
        iframeCopied = true;
        setTimeout(() => iframeCopied = false, 5000);

        toast.info("Copied", {
            description: "Paste it in your html."
        })
    }
</script>

<Dialog.Root bind:open={iframeDialogOpen}>
    <Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 bg-transparent")}>
        <Code class="h-4 w-4 mr-2" />
        Copy Iframe
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-lg max-h-full overflow-y-auto">
        <Dialog.Header>
            <Dialog.Title>Embed Event List</Dialog.Title>
            <Dialog.Description>
                Customize and copy the iframe code to embed this list on your website.
            </Dialog.Description>
        </Dialog.Header>
        
        <div class="flex gap-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle class="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div class="text-sm">
                <p class="font-medium text-amber-500">Script tag required</p>
                <p class="text-muted-foreground mt-1">
                    The script tag is required because it automatically adjusts the height of the iframe when content inside changes. If you dont want to include the script tag. Enable scrolling in the iframe to ensure users can see everything.
                </p>
            </div>
        </div>

        <div class="flex gap-3 p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <OctagonAlert class="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div class="text-sm">
                <p class="font-medium text-red-500">Do not change iframe id</p>
                <p class="text-muted-foreground mt-1">
                    The iframe id is used to watch iframe resize events and change the height of the iframe.
                </p>
            </div>
        </div>

        <div class="space-y-2">
            <Label>Generated Code</Label>
            <div class="relative">
                <pre class="p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto max-h-80 whitespace-pre-wrap break-all">{generateIframeCode(`${infosectionsLink}/elist/${listId}`, `Infosections List | ${listName}`, listId, infosectionsLink)}</pre>
            </div>
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => iframeDialogOpen = false}>Cancel</Button>
            <Button onclick={copyIframeCode}>
                {#if iframeCopied}
                    <Check class="h-4 w-4 mr-2" />
                    Copied!
                {:else}
                    <Copy class="h-4 w-4 mr-2" />
                    Copy Code
                {/if}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>