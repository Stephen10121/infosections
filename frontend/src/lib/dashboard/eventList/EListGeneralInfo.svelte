<script lang="ts">
    import { updateEventListForm } from "../../../routes/(mainWebsite)/dashboard/event-lists/eventListActions.remote";
    import { Textarea } from "@/components/ui/textarea";
    import * as Card from "@/components/ui/card/index";
    import { Label } from "@/components/ui/label";
    import { Input } from "@/components/ui/input";

    let {
        changed = $bindable(),
        listId,
        listName,
        listDescription
    }: {
        changed: boolean,
        listId: string,
        listName: string,
        listDescription: string
    } = $props();

    let listNameBindable = $derived(listName);
    let listDescriptionBindable = $derived(listDescription);

    $effect(() => {
        const listNameChanged = listName !== listNameBindable;
        const listDescriptionChanged = listDescription !== listDescriptionBindable;

        changed = listNameChanged || listDescriptionChanged;
    });
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>General Information</Card.Title>
        <Card.Description>Basic details about your event list</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
        <div class="space-y-2">
            {#if listId.length > 0}
                <input {...updateEventListForm.fields.id.as("hidden", listId)} />
            {/if}
            <Label for="list-id">List ID</Label>
            <Input
                id="list-id"
                value={listId}
                disabled
                class="font-mono text-sm"
            />
        </div>

        <div class="space-y-2">
            {#if listNameBindable.length > 0}
                <input {...updateEventListForm.fields.name.as("hidden", listNameBindable)} />
            {/if}
            <Label for="list-name">Feed Name</Label>
            <Input
                id="list-name"
                bind:value={listNameBindable}
                placeholder="Enter list name"
            />
        </div>

        <div class="space-y-2">
            {#if listDescriptionBindable.length > 0}
                <input {...updateEventListForm.fields.description.as("hidden", listDescriptionBindable)} />
            {/if}
            <Label for="list-description">Description</Label>
            <Textarea
                bind:value={listDescriptionBindable}
                placeholder="Enter list description"
                rows={3}
                id="list-description"
            />
        </div>
    </Card.Content>
</Card.Root>