<script lang="ts">
    import { getMyCalendars } from "../../../routes/(mainWebsite)/dashboard/backend.remote";
    import IncludedCalendars from "@/IncludedCalendars.svelte";
    import * as Card from "@/components/ui/card/index";

    let {
        feedId,
        pb_url,
        additionalCalendars
    }: {
        feedId: string,
        pb_url: string,
        additionalCalendars: string[]
    } = $props();
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Included Calendars</Card.Title>
        <Card.Description>You can also include 1 or more calendars that you have created in the <span><a class="underline" href="/dashboard/calendars">calendars page!</a></span> (Changes not reflected in Ifeed preview!)</Card.Description>
    </Card.Header>
    <Card.Content>
        <IncludedCalendars iFeedId={feedId} pb_url={pb_url} includedCalendars={additionalCalendars} calendars={await getMyCalendars()} />
    </Card.Content>
</Card.Root>