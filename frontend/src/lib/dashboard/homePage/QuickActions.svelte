<script lang="ts">
	import { LayoutList, Link2, CalendarDays, ImageIcon } from "@lucide/svelte";
	import * as Card from "@/components/ui/card/index";
	import { Button } from "@/components/ui/button";

	const actions = [
		{
			name: "New Calendar",
			description: "Create calendar view",
			icon: CalendarDays,
			href: "/dashboard/calendars?new=1",
			accent: "text-violet-500"
		},
		{
			name: "New Event List",
			description: "Create list view",
			icon: LayoutList,
			href: "/dashboard/event-lists?new=1",
			accent: "text-emerald-500"
		},
		{
			name: "New Image Feed",
			description: "Create carousel",
			icon: ImageIcon,
			href: "/dashboard/image-feeds?new=1",
			accent: "text-amber-500"
		},
		{
			name: "New Dynamic URL",
			description: "Create smart link",
			icon: Link2,
			href: "/dashboard/dynamic-urls?new=1",
			accent: "text-pink-400"
		}
	];
</script>

<Card.Root class="border-border/50 bg-card">
	<Card.Header class="pb-3">
		<Card.Title class="text-base font-semibold text-foreground">Quick Actions</Card.Title>
		<Card.Description class="text-xs">Create new views</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-2">
		{#each actions as action (`anAction${action.name}`)}
			<Button
				href={action.href}
				variant="ghost"
				class="w-full justify-start h-auto py-2.5 px-3 hover:bg-secondary"
			>
				<action.icon class={`h-4 w-4 mr-3 ${action.accent}`} />
				<div class="text-left">
					<span class="block text-sm font-medium text-foreground">{action.name}</span>
					<span class="block text-xs text-muted-foreground">{action.description}</span>
				</div>
			</Button>
		{/each}
	</Card.Content>
</Card.Root>
