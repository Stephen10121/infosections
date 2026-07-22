<script lang="ts">
	import { deleteImageFeedCommand } from "../../../routes/(mainWebsite)/dashboard/image-feeds/imageFeedActions.remote";
	import { Button, buttonVariants } from "@/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Card from "@/components/ui/card/index";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";
	import { cn } from "@/utils";

	let { feedId }: { feedId: string } = $props();

	async function deleteFeed() {
		let savingChanges = toast.loading("Removing Image Feed.", {
			duration: Number.POSITIVE_INFINITY
		});
		const response = await deleteImageFeedCommand(feedId);
		toast.dismiss(savingChanges);
		if (response.error) {
			toast.error(response.msg);
		} else {
			toast.success(response.msg);
			goto("/dashboard/image-feeds");
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Quick Actions</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-2">
		<!-- Delete Feed Dialog -->
		<Dialog.Root>
			<Dialog.Trigger
				class={cn(
					buttonVariants({ variant: "outline" }),
					"w-full justify-start text-destructive hover:bg-red-500 bg-transparent"
				)}
			>
				Delete Feed
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently delete this image feed from our
						servers. All links relying on this feed will not work.
					</Dialog.Description>
					<Dialog.Footer>
						<Button variant="destructive" onclick={deleteFeed}>Confirm Delete</Button>
					</Dialog.Footer>
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>
	</Card.Content>
</Card.Root>
