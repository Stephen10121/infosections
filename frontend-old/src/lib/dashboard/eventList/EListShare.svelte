<script lang="ts">
    import { Copy, Link2, SquareArrowOutUpRight } from "@lucide/svelte";
    import * as Card from "@/components/ui/card/index";
    import { Button } from "@/components/ui/button";
    import { toast } from "svelte-sonner";

    let { listId }: { listId: string } = $props();

    function handleCopyLink() {
        const link = `${window.location.origin}/elist/${listId}`;

        navigator.clipboard.writeText(link);

        toast.info("Copied", {
            description: link,
            descriptionClass: "underline"
        })
    }
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Link</Card.Title>
        <Card.Description>Share this list with others</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-3">
        <div class="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Link2 class="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span class="text-sm font-mono truncate">/elist/{listId}</span>
        </div>
        <Button onclick={handleCopyLink} class="w-full gap-2 bg-transparent" variant="outline">
            <Copy class="h-4 w-4" />
            Copy Link
        </Button>
        <Button class="w-full gap-2" href="/elist/{listId}" target="_blank">
            <SquareArrowOutUpRight class="h-4 w-4" />
            Goto Page
        </Button>
    </Card.Content>
</Card.Root>