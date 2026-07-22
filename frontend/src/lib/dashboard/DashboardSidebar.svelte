<script lang="ts">
	import {
		Calendar,
		Home,
		GalleryHorizontalEnd,
		ChevronsUpDownIcon,
		CreditCardIcon,
		LogOutIcon,
		LayoutList,
		Gift,
		Link2,
		Flag,
		RefreshCw,
		Plus
	} from "@lucide/svelte";
	import { getMyIntegrations } from "../../routes/(mainWebsite)/dashboard/backend.remote";
	import { capitalizeFirstLetter, type IntegrationModel, type UserModel } from "@/utils";
	import IntegrationInfoDialog from "./integrations/IntegrationInfoDialog.svelte";
	import AddIntegrationDialog from "./integrations/AddIntegrationDialog.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import StatusBadge from "./integrations/StatusBadge.svelte";
	import BreezeIcon from "./integrations/BreezeIcon.svelte";
	import XIcon from "./integrations/XIcon.svelte";

	let {
		user,
		pathname,
		userAvatar,
		stripeCustomerPortal,
		stripeSubscriptionUrl,
		stripeTrialSubscriptionUrl
	}: {
		user: UserModel;
		pathname: string;
		userAvatar: string;
		stripeCustomerPortal: string;
		stripeSubscriptionUrl: string;
		stripeTrialSubscriptionUrl: string;
	} = $props();

	const sidebar = useSidebar();

	const navigation = [
		{ title: "Home", icon: Home, url: "/dashboard" },
		{ title: "Calendars", icon: Calendar, url: "/dashboard/calendars" },
		{ title: "Image Feeds", icon: GalleryHorizontalEnd, url: "/dashboard/image-feeds" },
		{ title: "Event Lists", icon: LayoutList, url: "/dashboard/event-lists" },
		{ title: "Dynamic URLs", url: "/dashboard/dynamic-urls", icon: Link2 }
	];

	let userAccountDropdownOpen = $state(false);
	let addIntegrationDropdownOpen = $state(false);
	let selectedIntegration: IntegrationModel | null = $state(null);
</script>

<Sidebar.Root collapsible="icon" class="bg-card">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					size="lg"
					class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<div
						class="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-ring"
					>
						<Calendar class="size-4" />
					</div>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-medium"> InfoSections </span>
						<span class="truncate text-xs">
							{#if user.accessLevel === "none"}Free{:else}{capitalizeFirstLetter(
									user.accessLevel
								)}{/if} Plan
						</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Dashboard</Sidebar.GroupLabel>
			<Sidebar.Menu>
				{#each navigation as item (item.title)}
					<Sidebar.MenuButton
						tooltipContent={item.title}
						class={pathname === item.url ||
						(pathname.includes("/dashboard/calendars") && item.url === "/dashboard/calendars") ||
						(pathname.includes("/dashboard/image-feeds") &&
							item.url === "/dashboard/image-feeds") ||
						(pathname.includes("/dashboard/event-lists") && item.url === "/dashboard/event-lists")
							? "bg-ring/10 text-ring hover:text-ring hover:bg-ring/10"
							: "text-muted-foreground hover:bg-ring/10 hover:text-foreground"}
						onclick={() => {
							if (sidebar.openMobile) {
								sidebar.setOpenMobile(false);
							}
						}}
					>
						{#snippet child({ props })}
							<a href={item.url} {...props}>
								{#if item.icon}
									<item.icon />
								{/if}
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>

		{#if sidebar.open || sidebar.isMobile}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Integrations</Sidebar.GroupLabel>
				<Sidebar.GroupAction
					title="Add Integration"
					onclick={() => {
						addIntegrationDropdownOpen = true;
						if (sidebar.openMobile) {
							sidebar.setOpenMobile(false);
						}
					}}
				>
					<Plus />
					<span class="sr-only">Add Project</span>
				</Sidebar.GroupAction>
				<Sidebar.Menu>
					{#each await getMyIntegrations() as integration (`anintegration${integration.id}`)}
						<Sidebar.MenuButton
							tooltipContent={integration.prettyName}
							class="text-muted-foreground hover:bg-ring/10 hover:text-foreground"
							onclick={() => {
								if (sidebar.openMobile) {
									sidebar.setOpenMobile(false);
								}
								selectedIntegration = integration;
							}}
						>
							{#if integration.service === "planningcenter"}
								<Flag />
							{:else if integration.service === "breeze"}
								<BreezeIcon />
							{:else if integration.service === "twitter"}
								<XIcon />
							{:else}
								<RefreshCw />
							{/if}
							<span class="flex-1 truncate">{integration.prettyName}</span>
							<StatusBadge status={integration.status} />
						</Sidebar.MenuButton>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root bind:open={userAccountDropdownOpen}>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								size="lg"
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								{...props}
							>
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image src={userAvatar} alt={user.name} />
									<Avatar.Fallback class="rounded-lg"
										>{user.name
											.split(" ")
											.map((n) => (n[0] ? n[0].toUpperCase() : ""))
											.join("")}</Avatar.Fallback
									>
								</Avatar.Root>

								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.name}</span>
									<span class="truncate text-xs">{user.email}</span>
								</div>
								<ChevronsUpDownIcon class="ml-auto size-4" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
						side={sidebar.isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Label class="p-0 font-normal">
							<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image src={userAvatar} alt={user.name} />
									<Avatar.Fallback class="rounded-lg"
										>{user.name
											.split(" ")
											.map((n) => (n[0] ? n[0].toUpperCase() : ""))
											.join("")}</Avatar.Fallback
									>
								</Avatar.Root>

								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.name}</span>
									<span class="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenu.Label>

						<DropdownMenu.Separator />

						<DropdownMenu.Group>
							{#if user.accessLevel !== "none"}
								<DropdownMenu.Item>
									{#snippet child({ props })}
										<a
											class="w-full h-full"
											href="{stripeCustomerPortal}?prefilled_email={user.email}"
											target="_blank"
											{...props}
										>
											<CreditCardIcon class="data-highlighted:text-primary" />
											Billing
										</a>
									{/snippet}
								</DropdownMenu.Item>
							{:else}
								<DropdownMenu.Item>
									{#snippet child({ props })}
										<a class="w-full h-full" href={stripeSubscriptionUrl} {...props}>
											<CreditCardIcon class="data-highlighted:text-primary" />
											Setup Payments
										</a>
									{/snippet}
								</DropdownMenu.Item>
								<DropdownMenu.Item>
									{#snippet child({ props })}
										<a class="w-full h-full" href={stripeTrialSubscriptionUrl} {...props}>
											<Gift class="data-highlighted:text-primary" />
											Free Trial
										</a>
									{/snippet}
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Group>

						<DropdownMenu.Separator />

						<DropdownMenu.Item>
							{#snippet child({ props })}
								<a class="w-full h-full" href="/logout" {...props}>
									<LogOutIcon class="data-highlighted:text-primary" />
									Log out
								</a>
							{/snippet}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>

<AddIntegrationDialog bind:open={addIntegrationDropdownOpen} />
<IntegrationInfoDialog bind:integration={selectedIntegration} />
