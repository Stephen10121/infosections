<script lang="ts">
    import { updateCalendarForm } from "../../../routes/(mainWebsite)/dashboard/calendars/calendarActions.remote";
    import { Textarea } from "@/components/ui/textarea";
    import * as Card from "@/components/ui/card/index";
    import { Label } from "@/components/ui/label";
    import { Input } from "@/components/ui/input";

    let {
        changed = $bindable(),
        calId,
        calendarName,
        calendarDescription
    }: {
        changed: boolean,
        calId: string,
        calendarName: string,
        calendarDescription: string
    } = $props();

    let calendarNameBindable = $derived(calendarName);
    let calendarDescriptionBindable = $derived(calendarDescription);

    $effect(() => {
        const calendarNameChanged = calendarName !== calendarNameBindable;
        const calendarDescriptionChanged = calendarDescription !== calendarDescriptionBindable;

        changed = calendarNameChanged || calendarDescriptionChanged;
    });
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>General Information</Card.Title>
        <Card.Description>Basic details about your calendar</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
        <div class="space-y-2">
            {#if calId.length > 0}
                <input {...updateCalendarForm.fields.id.as("hidden", calId)} />
            {/if}
            <Label for="calendar-id">Calendar ID</Label>
            <Input
                id="calendar-id"
                value={calId}
                disabled
                class="font-mono text-sm"
            />
        </div>

        <div class="space-y-2">
            {#if calendarNameBindable.length > 0}
                <input {...updateCalendarForm.fields.name.as("hidden", calendarNameBindable)} />
            {/if}
            <Label for="calendar-name">Calendar Name</Label>
            <Input
                id="calendar-name"
                bind:value={calendarNameBindable}
                placeholder="Enter calendar name"
            />
        </div>

        <div class="space-y-2">
            {#if calendarDescriptionBindable.length > 0}
                <input {...updateCalendarForm.fields.description.as("hidden", calendarDescriptionBindable)} />
            {/if}
            <Label for="calendar-description">Description</Label>
            <Textarea
                bind:value={calendarDescriptionBindable}
                placeholder="Enter calendar description"
                rows={3}
                id="calendar-description"
            />
        </div>
    </Card.Content>
</Card.Root>