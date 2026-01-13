<script lang="ts">
    import { navigating } from '$app/state';
    import DashboardHeader from '@/dashboard/DashboardHeader.svelte';
    import DashboardIsNavigating from '@/dashboard/DashboardIsNavigating.svelte';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import DashboardSidebar from '@/dashboard/DashboardSidebar.svelte';
    import SetEmailPopup from '@/dashboard/SetEmailPopup.svelte';
    import { emailNotSetDialog } from '@/store.js';

	let { children, data } = $props();

	emailNotSetDialog.set(!data.user.userEmail);
</script>

<SetEmailPopup />

<Sidebar.Provider class="flex min-h-screen bg-background" style="--sidebar-width: 16rem; --sidebar-width-mobile: 16rem;">
	<DashboardSidebar
		user={data.user}
		userAvatar={data.avatar}
		pathname={data.pathname}
		stripeUrl={data.stripeUrl}
		stripeFreeTrialUrl={data.stripeFreeTrialUrl}
		stripeCustomerPortal={data.stripeCustomerPortal}
	/>

	<div class="flex-1 flex flex-col h-full">
		<DashboardHeader calendars={data.calendars} imageFeeds={data.imageFeeds} eventLists={data.eventLists} />

		<main class="flex-1 p-6 space-y-6 mainPage relative h-full">
			{#if navigating.complete !== null}
				<DashboardIsNavigating />
			{/if}
			{@render children?.()}
		</main>
	</div>
</Sidebar.Provider>

<style>
	.mainPage {
		max-height: calc(100vh - 64px);
		overflow-y: auto;
	}
</style>