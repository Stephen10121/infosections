<script lang="ts">
    import { Button } from "@/components/ui/button";
    import * as Card from "@/components/ui/card/index";
    import { refreshingEvents } from "@/utils";
    import { LayoutList, ImageIcon, CalendarDays, RefreshCw } from "@lucide/svelte";

    const actions = [
        {
            name: "New Event List",
            icon: LayoutList,
            description: "Create list view",
            href: "/dashboard/event-lists?new=1"
        },
        {
            name: "New Image Feed",
            icon: ImageIcon,
            description: "Create carousel",
            href: "/dashboard/image-feeds?new=1"
        },
        {
            name: "New Calendar",
            icon: CalendarDays,
            description: "Create calendar",
            href: "/dashboard/calendars?new=1"
        },
    ]
</script>

<Card.Root>
    <Card.Header>
        <Card.Title class="text-base font-medium">Quick Actions</Card.Title>
        <Card.Description>Create new views or sync events</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="grid grid-cols-2 gap-2">
            {#each actions as action (`anaction${action.name}`)}
                <Button variant="outline" class="h-auto flex-col gap-2 py-4 bg-transparent" href={action.href}>
                    <action.icon class="h-5 w-5 text-ring" />
                    <span class="text-xs">{action.name}</span>
                </Button>
            {/each}
            <Button variant="outline" class="h-auto flex-col gap-2 py-4 bg-transparent" onclick={refreshingEvents}>
                <RefreshCw class="h-5 w-5 text-ring" />
                <span class="text-xs">Sync Events</span>
            </Button>
        </div>
    </Card.Content>
</Card.Root>