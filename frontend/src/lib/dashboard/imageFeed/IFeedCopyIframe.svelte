<script lang="ts">
	import { Button, buttonVariants } from "@/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Check, Code, Copy } from "@lucide/svelte";
	import { cn, generateIframeCode } from "@/utils";
	import { Label } from "@/components/ui/label";
	import { toast } from "svelte-sonner";

	let {
		feedId,
		feedName,
		infosectionsLink
	}: {
		feedId: string;
		feedName: string;
		infosectionsLink: string;
	} = $props();

	let iframeCopied = $state(false);
	let iframeDialogOpen = $state(false);

	function copyIframeCode() {
		const link = generateIframeCode(
			`${infosectionsLink}/ifeed/${feedId}`,
			`Infosections Feed | ${feedName}`,
			feedId,
			infosectionsLink,
			true
		);
		navigator.clipboard.writeText(link);
		iframeCopied = true;
		setTimeout(() => (iframeCopied = false), 5000);

		toast.info("Copied", {
			description: "Paste it in your html."
		});
	}
</script>

<Dialog.Root bind:open={iframeDialogOpen}>
	<Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 bg-transparent")}>
		<Code class="h-4 w-4 mr-2" />
		Copy Iframe
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-lg max-h-full overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Embed Image Feed</Dialog.Title>
			<Dialog.Description>
				Customize and copy the iframe code to embed this feed on your website.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-2">
			<Label>Generated Code</Label>
			<div class="relative">
				<pre
					class="p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto max-h-80 whitespace-pre-wrap break-all">{generateIframeCode(
						`${infosectionsLink}/ifeed/${feedId}`,
						`Infosections Feed | ${feedName}`,
						feedId,
						infosectionsLink,
						true
					)}</pre>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (iframeDialogOpen = false)}>Cancel</Button>
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
