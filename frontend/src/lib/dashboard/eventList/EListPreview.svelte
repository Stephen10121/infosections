<script lang="ts">
	import type { ImageListCustomizations } from "@/utils";
	import * as Card from "@/components/ui/card/index";
	import { browser } from "$app/environment";

	let {
		displaySettings,
		listId
	}: {
		displaySettings: ImageListCustomizations;
		listId: string;
	} = $props();

	let previewIFrame: HTMLIFrameElement | undefined = $state();

	$effect(() => {
		if (displaySettings && previewIFrame && previewIFrame.contentWindow) {
			previewIFrame.contentWindow.postMessage({
				call: "displaySettings",
				value: JSON.stringify(displaySettings)
			});
		}
	});
</script>

<svelte:head>
	{#if browser}
		<script async src="/resizeObserver.js"></script>
	{/if}
</svelte:head>

<Card.Root>
	<Card.Header>
		<Card.Title>Elist Preview</Card.Title>
		<Card.Description
			>See the current changes in this preview before saving the settings.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<div class="w-full">
			<iframe
				bind:this={previewIFrame}
				style="background: none transparent; border: none;display:block;"
				allowtransparency
				width="100%"
				height="100%"
				src="/elistPreview/{listId}"
				scrolling="no"
				title="Event List Preview"
				id="iframe{listId}"
				frameborder="0"
			></iframe>
		</div>
	</Card.Content>
</Card.Root>
