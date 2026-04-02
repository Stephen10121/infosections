<script lang="ts">
    import { ArrowUpRight, type IconProps } from "@lucide/svelte";
    import * as Card from "@/components/ui/card/index";
    import type { Component, Snippet } from "svelte";
    import { Button } from "@/components/ui/button";
    import { cn } from "@/utils";
    
    let { title, description, icon: Icon, accent, bgAccent, href, children, class: className }: {
        title: string
        description: string
        icon: Component<IconProps, {}, "">
        accent: string
        bgAccent: string
        href: string
        children: Snippet
        class?: string
    } = $props();

</script>

<Card.Root class={cn("border-border/50 bg-card overflow-hidden", className)}>
    <Card.Header class="pb-3">
        <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
            <div class={cn("rounded-lg p-2", bgAccent)}>
                <Icon class={cn("h-5 w-5", accent)} />
            </div>
            <div>
                <Card.Title class="text-base font-semibold text-foreground">{title}</Card.Title>
                <Card.Description class="text-xs">{description}</Card.Description>
            </div>
            </div>
            <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
            <a href={href}>
                <ArrowUpRight class="h-4 w-4" />
                <span class="sr-only">View all {title}</span>
            </a>
            </Button>
        </div>
    </Card.Header>
    <Card.Content class="pt-0">{@render children()}</Card.Content>
</Card.Root>