<script lang="ts">
    import { deleteCalendarCommand } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
    import { Button, buttonVariants } from "@/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Card from "@/components/ui/card/index";
    import { cn } from "@/utils";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";

    let { calId }: { calId: string } = $props();

    async function deleteCal() {
        let savingChanges = toast.loading("Removing Calendar.", { duration: Number.POSITIVE_INFINITY });
        const response = await deleteCalendarCommand(calId);
        toast.dismiss(savingChanges);
        if (response.error) {
            toast.error(response.msg);
        } else {
            toast.success(response.msg);
            goto("/dashboard/calendars");
        }
    }
</script>

<Card.Root>
    <Card.Header>
    <Card.Title>Quick Actions</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-2">
        <!-- Delete Calendar Dialog -->
        <Dialog.Root>
            <Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-destructive hover:bg-red-500 bg-transparent")}>
                Delete Calendar
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
                    <Dialog.Description>
                        This action cannot be undone. This will permanently delete this calendar from our servers. All links or image feeds relying on this calendar will not work.
                    </Dialog.Description>
                    <Dialog.Footer>
                        <Button variant="destructive" onclick={deleteCal}>Confirm Delete</Button>
                    </Dialog.Footer>
                </Dialog.Header>
            </Dialog.Content>
        </Dialog.Root>
    </Card.Content>
</Card.Root>