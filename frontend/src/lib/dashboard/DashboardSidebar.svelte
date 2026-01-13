<script lang="ts">
    import { Calendar, Home, GalleryHorizontalEnd, ChevronsUpDownIcon, CreditCardIcon, LogOutIcon, LayoutList, RefreshCcw, Gift } from "@lucide/svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import { capitalizeFirstLetter, refreshingEvents, type UserModel } from "@/utils";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { emailNotSetDialog } from "@/store";

    let { 
        user,
        pathname,
        stripeUrl,
        stripeFreeTrialUrl,
        userAvatar,
        stripeCustomerPortal
    }: {
        user: UserModel,
        pathname: string,
        stripeUrl: string,
        stripeFreeTrialUrl: string,
        userAvatar: string,
        stripeCustomerPortal: string
    } = $props();

    const sidebar = useSidebar();
    
    const navigation = [
      { title: "Home", icon: Home, url: "/dashboard" },
      { title: "Calendars", icon: Calendar, url: "/dashboard/calendars"  },
      { title: "Image Feeds", icon: GalleryHorizontalEnd, url: "/dashboard/image-feeds" },
      { title: "Event Lists", icon: LayoutList, url: "/dashboard/event-lists" }
    ];

    let userAccountDropdownOpen = $state(false);
</script>

<Sidebar.Root collapsible="icon" class="bg-card">
    <Sidebar.Header>
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton
                    size="lg"
                    class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div class="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-ring">
                        <Calendar class="size-4" />
                    </div>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                        <span class="truncate font-medium">
                            InfoSections
                        </span>
                        <span class="truncate text-xs">
                            {#if user.accessLevel === "none"}Free{:else}{capitalizeFirstLetter(user.accessLevel)}{/if} Plan
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
                    <Sidebar.MenuButton tooltipContent={item.title} class={pathname === item.url || (pathname.includes("/dashboard/calendars") && item.url === "/dashboard/calendars") || (pathname.includes("/dashboard/image-feeds") && item.url === "/dashboard/image-feeds") || (pathname.includes("/dashboard/event-lists") && item.url === "/dashboard/event-lists") ? "bg-ring/10 text-ring hover:text-ring hover:bg-ring/10" : "text-muted-foreground hover:bg-ring/10 hover:text-foreground"}>
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
                                    <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
                                </Avatar.Root>

                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-medium">{user.name}</span>
                                    <span class="truncate text-xs">{user.userEmail}</span>
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
                                    <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
                                </Avatar.Root>

                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-medium">{user.name}</span>
                                    <span class="truncate text-xs">{user.userEmail}</span>
                                </div>
                            </div>
                        </DropdownMenu.Label>

                        <DropdownMenu.Separator />

                        <DropdownMenu.Group>
                            {#if user.accessLevel !== "none"}
                                <DropdownMenu.Item>
                                    {#snippet child({ props })}
                                        <a class="w-full h-full" href="{stripeCustomerPortal}?prefilled_email={user.userEmail}" target="_blank" {...props}>
                                            <CreditCardIcon class="data-highlighted:text-primary" />
                                            Billing
                                        </a>
                                    {/snippet}
                                </DropdownMenu.Item>
                            {:else}
                                {#if user.userEmail}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a class="w-full h-full" href="{stripeUrl}?prefilled_email={user.userEmail}" {...props}>
                                                <CreditCardIcon class="data-highlighted:text-primary" />
                                                Setup Payments
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a class="w-full h-full" href="{stripeFreeTrialUrl}?prefilled_email={user.userEmail}" {...props}>
                                                <Gift class="data-highlighted:text-primary" />
                                                Free Trial
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                {:else}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <button style="width:100%;" {...props} onclick={() => {
                                                userAccountDropdownOpen = false;
                                                emailNotSetDialog.set(true);
                                            }}>
                                                <CreditCardIcon class="data-highlighted:text-primary" />
                                                Setup Payments
                                            </button>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                {/if}
                            {/if}
                            <DropdownMenu.Item>
                                {#snippet child({ props })}
                                    <button style="width:100%;" {...props} onclick={refreshingEvents}>
                                        <RefreshCcw class="data-highlighted:text-primary" />
                                        Refresh My Events
                                    </button>
                                {/snippet}
                            </DropdownMenu.Item>
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