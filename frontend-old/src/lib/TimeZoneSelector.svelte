<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";

    let { timeZone = $bindable() }: { timeZone: string } = $props();

    let timezones = $state([
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "America/Phoenix",
        "America/Anchorage",
        "Pacific/Honolulu",
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Europe/Moscow",
        "Asia/Tokyo",
        "Asia/Seoul",
        "Asia/Shanghai",
        "Asia/Kolkata",
        "Asia/Dubai",
        "Australia/Sydney",
        "Australia/Perth",
        "America/Sao_Paulo",
        "Africa/Johannesburg"
    ]);

    const triggerContent = $derived(timezones.find((azone) => azone === timeZone) ?? "Select a timezone");
</script>
 
<Select.Root type="single" name="selectTimezone" bind:value={timeZone}>
    <Select.Trigger class="w-[180px]">
        {triggerContent}
    </Select.Trigger>
    <Select.Content>
        <Select.Group>
            <Select.Label>Timezones</Select.Label>
            {#each timezones as timezone (timezone)}
                <Select.Item
                    value={timezone}
                    label={timezone}
                >
                    {timezone}
                </Select.Item>
            {/each}
        </Select.Group>
    </Select.Content>
</Select.Root>