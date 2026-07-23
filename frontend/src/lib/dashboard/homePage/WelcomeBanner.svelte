<script lang="ts">
	import Mono from "@/components/Mono.svelte";
	import { getGreeting, type IntegrationModel, type UserModel } from "@/utils.js";
	import { CalendarDays, ImageIcon, LayoutList, Link2 } from "@lucide/svelte";
	import type { Component } from "svelte";

	let { myIntegrations, user }: { myIntegrations: IntegrationModel[]; user: UserModel } = $props();

	const quickActions: {
		label: string;
		icon: Component;
		color: string;
		link: string;
	}[] = [
		{
			label: "New Calendar",
			icon: CalendarDays,
			color: "text-violet-500",
			link: "/dashboard/calendars?new=1"
		},
		{
			label: "New Image Feed",
			icon: ImageIcon,
			color: "text-amber-500",
			link: "/dashboard/image-feeds?new=1"
		},
		{
			label: "New Event List",
			icon: LayoutList,
			color: "text-emerald-500",
			link: "/dashboard/event-lists?new=1"
		},
		{
			label: "New Dynamic URL",
			icon: Link2,
			color: "text-pink-500",
			link: "/dashboard/dynamic-urls?new=1"
		}
	];
</script>

<div class="px-8 py-8 border-b border-border bg-card/20">
	<div class="flex items-end justify-between">
		<div>
			<Mono class="text-[10px] text-muted-foreground">{getGreeting()}</Mono>
			<h1
				class="text-3xl font-extrabold text-foreground mt-1 tracking-tight"
				style="font-family: Inter, sans-serif"
			>
				{user.name}
			</h1>
			<div class="flex items-center gap-4 mt-3">
				<Mono class="text-[10px] text-muted-foreground"
					>org · {#if user.accessLevel === "none"}free{:else}{user.accessLevel}{/if} plan</Mono
				>
				<Mono class="text-[10px] text-muted-foreground">
					{#if myIntegrations.length > 0}
						{@const connectedInts = myIntegrations.filter((int) => int.status === "connected")}
						{#each connectedInts as int, i (int.id)}
							{#if i !== 0}
								<span class="ml-1">|</span>
							{/if}
							{int.prettyName}
						{/each}
					{:else}
						None
					{/if}
					· <span class="text-primary">connected</span></Mono
				>
			</div>
		</div>
		<div class="hidden md:flex items-center gap-2">
			{#each quickActions as { label, icon: Icon, color, link } (link)}
				<a
					href={link}
					class="flex items-center gap-2 px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
					title={label}
				>
					<Icon size={13} class={color} />
					<Mono class="text-[10px]">{label}</Mono>
				</a>
			{/each}
		</div>
	</div>
</div>
