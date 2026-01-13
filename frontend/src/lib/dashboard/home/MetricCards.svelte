<script lang="ts">
    import { cn } from "@/utils";
    import { Calendar, CalendarDays, ImageIcon, LayoutList } from "@lucide/svelte";
    import * as Card from "@/components/ui/card/index";

    let { 
        eventAmount,
        eventListAmount,
        imageFeedsAmount,
        calendarsAmount
    }: {
        eventAmount: number,
        eventListAmount: number,
        imageFeedsAmount: number,
        calendarsAmount: number
    } = $props();

    const metrics = [
        {
            name: "Upcoming Events Synced",
            value: eventAmount,
            icon: Calendar,
            description: "From Planning Center",
            accent: "text-blue-500",
            bgAccent: "bg-blue-500/10",
        },
        {
            name: "Event Lists",
            value: eventListAmount,
            icon: LayoutList,
            description: "Created",
            accent: "text-emerald-500",
            bgAccent: "bg-emerald-500/10",
        },
        {
            name: "Image Feeds",
            value: imageFeedsAmount,
            icon: ImageIcon,
            description: "Created",
            accent: "text-amber-500",
            bgAccent: "bg-amber-500/10",
        },
        {
            name: "Calendars",
            value: calendarsAmount,
            icon: CalendarDays,
            description: "Created",
            accent: "text-violet-500",
            bgAccent: "bg-violet-500/10",
        },
    ]
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each metrics as metric (`metric${metric.name}`)}
        <Card.Root class="bg-card">
            <Card.Content class="p-6">
                <div class="flex items-center justify-between">
                    <div class={cn("flex h-10 w-10 items-center justify-center rounded-lg", metric.bgAccent)}>
                        <metric.icon class={cn("h-5 w-5", metric.accent)} />
                    </div>
                </div>

                <div class="mt-4">
                    <p class="text-2xl font-bold">{metric.value}</p>
                    <p class="text-sm font-medium">{metric.name}</p>
                    <p class="text-xs text-muted-foreground">{metric.description}</p>
                </div>
            </Card.Content>
        </Card.Root>
    {/each}
</div>