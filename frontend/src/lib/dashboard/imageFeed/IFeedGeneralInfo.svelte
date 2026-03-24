<script lang="ts">
    import { updateImageFeedForm } from "../../../routes/(mainWebsite)/dashboard/image-feeds/imageFeedActions.remote";
    import { Textarea } from "@/components/ui/textarea";
    import * as Card from "@/components/ui/card/index";
    import { Label } from "@/components/ui/label";
    import { Input } from "@/components/ui/input";

    let {
        changed = $bindable(),
        feedId,
        feedName,
        feedDescription
    }: {
        changed: boolean,
        feedId: string,
        feedName: string,
        feedDescription: string
    } = $props();

    let feedNameBindable = $derived(feedName);
    let feedDescriptionBindable = $derived(feedDescription);

    $effect(() => {
        const feedNameChanged = feedName !== feedNameBindable;
        const feedDescriptionChanged = feedDescription !== feedDescriptionBindable;

        changed = feedNameChanged || feedDescriptionChanged;
    });
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>General Information</Card.Title>
        <Card.Description>Basic details about your image feed</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
        <div class="space-y-2">
            {#if feedId.length > 0}
                <input {...updateImageFeedForm.fields.id.as("hidden", feedId)} />
            {/if}
            <Label for="feed-id">Feed ID</Label>
            <Input
                id="feed-id"
                value={feedId}
                disabled
                class="font-mono text-sm"
            />
        </div>

        <div class="space-y-2">
            {#if feedNameBindable.length > 0}
                <input {...updateImageFeedForm.fields.name.as("hidden", feedNameBindable)} />
            {/if}
            <Label for="feed-name">Feed Name</Label>
            <Input
                id="feed-name"
                bind:value={feedNameBindable}
                placeholder="Enter feed name"
            />
        </div>

        <div class="space-y-2">
            {#if feedDescriptionBindable.length > 0}
                <input {...updateImageFeedForm.fields.description.as("hidden", feedDescriptionBindable)} />
            {/if}
            <Label for="feed-description">Description</Label>
            <Textarea
                bind:value={feedDescriptionBindable}
                placeholder="Enter feed description"
                rows={3}
                id="feed-description"
            />
        </div>
    </Card.Content>
</Card.Root>