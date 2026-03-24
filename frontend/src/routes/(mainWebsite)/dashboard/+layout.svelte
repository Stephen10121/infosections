<script lang="ts">
    import { navigating } from '$app/state';
    import DashboardHeader from '@/dashboard/DashboardHeader.svelte';
    import DashboardIsNavigating from '@/dashboard/DashboardIsNavigating.svelte';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import DashboardSidebar from '@/dashboard/DashboardSidebar.svelte';
    import { afterNavigate } from '$app/navigation';
    import { browser } from '$app/environment';
    import { getMyCalendars, getMyEventLists, getMyImageFeeds } from './backend.remote.js';

	let { children, data } = $props();

	afterNavigate(() => {
		if (browser) {
			const element = document.getElementById('ascrollableelement'); 
			if (element) {
				element.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				// Fallback for default window scroll
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}
	});
</script>

<Sidebar.Provider class="flex min-h-screen bg-background" style="--sidebar-width: 16rem; --sidebar-width-mobile: 16rem;">
	<DashboardSidebar
		user={data.user}
		userAvatar={data.avatar}
		pathname={data.pathname}
		stripeCustomerPortal={data.stripeCustomerPortal}
		stripeSubscriptionUrl={data.stripeSubscriptionUrl}
		stripeTrialSubscriptionUrl={data.stripeTrialSubscriptionUrl}
	/>

	<div class="flex-1 flex flex-col h-full">
		<DashboardHeader calendars={await getMyCalendars()} imageFeeds={await getMyImageFeeds()} eventLists={await getMyEventLists()} />

		<main class="flex-1 p-6 space-y-6 mainPage relative h-full" id="ascrollableelement">
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