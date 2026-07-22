<script lang="ts">
	import { Copy, Link2, SquareArrowOutUpRight } from "@lucide/svelte";
	import EListCopyIframe from "./EListCopyIframe.svelte";
	import * as Card from "@/components/ui/card/index";
	import { Button } from "@/components/ui/button";
	import { toast } from "svelte-sonner";
	import { page } from "$app/stores";

	let { listId, listName }: { listId: string; listName: string } = $props();

	function handleCopyLink() {
		const link = `${window.location.origin}/elist/${listId}`;

		navigator.clipboard.writeText(link);

		toast.info("Copied", {
			description: link,
			descriptionClass: "underline"
		});
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Link</Card.Title>
		<Card.Description>Share this list with others</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-3">
		<div class="flex justify-between items-center gap-2 p-3 bg-muted rounded-lg">
			<Link2 class="h-4 w-4 text-muted-foreground shrink-0" />
			<span class="text-sm font-mono truncate w-full">/elist/{listId}</span>
			<button
				onclick={handleCopyLink}
				class="hover:bg-accent transition-colors duration-300 ease-in-out p-1 rounded"
				title="Copy Link"
			>
				<Copy class="h-4 w-4 text-muted-foreground shrink-0" />
			</button>
		</div>
		<EListCopyIframe {listId} {listName} infosectionsLink={$page.url.origin} />
		<Button class="w-full gap-2" href="/elist/{listId}" target="_blank">
			<SquareArrowOutUpRight class="h-4 w-4" />
			Goto Page
		</Button>
	</Card.Content>
</Card.Root>
