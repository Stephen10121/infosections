<script lang="ts">
    import { deleteEventListCommand } from "../../../routes/(mainWebsite)/dashboard/event-lists/eventListActions.remote";
    import { Button, buttonVariants } from "@/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Card from "@/components/ui/card/index";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import { cn } from "@/utils";

    let { listId }: { listId: string } = $props();

    async function deleteList() {
        let deleting = toast.loading("Removing Event list.", { duration: Number.POSITIVE_INFINITY });
        const response = await deleteEventListCommand(listId);
        toast.dismiss(deleting);
        if (response.error) {
            toast.error(response.msg);
        } else {
            toast.success(response.msg);
            goto("/dashboard/event-lists");
        }
    }
</script>

<Card.Root>
    <Card.Header>
    <Card.Title>Quick Actions</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-2">
        <!-- Delete List Dialog -->
        <Dialog.Root>
            <Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-destructive hover:bg-red-500 bg-transparent")}>
                Delete List
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
                    <Dialog.Description>
                        This action cannot be undone. This will permanently delete this event list from our servers. All links relying on this list will not work.
                    </Dialog.Description>
                    <Dialog.Footer>
                        <Button variant="destructive" onclick={deleteList}>Confirm Delete</Button>
                    </Dialog.Footer>
                </Dialog.Header>
            </Dialog.Content>
        </Dialog.Root>
    </Card.Content>
</Card.Root>