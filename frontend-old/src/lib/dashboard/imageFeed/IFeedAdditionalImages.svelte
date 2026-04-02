<script lang="ts">
    import { getCustomImagesForIFeed, getMyImageFeeds } from "../../../routes/(mainWebsite)/dashboard/backend.remote";
    import CustomImages from "@/ifeedslug/CustomImages.svelte";
    import * as Card from "@/components/ui/card/index";

    let {
        feedId,
        pb_url
    }: {
        feedId: string,
        pb_url: string
    } = $props();
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Additional Images</Card.Title>
        <Card.Description>Add any extra pics that are not in planning center, but you want in the image feed. (Changes not reflected in Ifeed preview!)</Card.Description>
    </Card.Header>
    <Card.Content>
        <CustomImages customImages={await getCustomImagesForIFeed(feedId)} apiServer={pb_url} imageFeeds={await getMyImageFeeds()} currentFeedID={feedId} />
    </Card.Content>
</Card.Root>