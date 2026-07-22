<script lang="ts">
	import Features from "@/landingPage/Features.svelte";
	import Header from "@/landingPage/Header.svelte";
	import { afterNavigate } from "$app/navigation";
	import { errorTypes, hasKey } from "@/utils.js";
	import Stats from "@/landingPage/Stats.svelte";
	import Hero from "@/landingPage/Hero.svelte";
	import CTA from "@/landingPage/CTA.svelte";
	import { browser } from "$app/environment";
	import { toast } from "svelte-sonner";
	import { page } from "$app/stores";

	let { data } = $props();

	afterNavigate(() => {
		if (browser) {
			const errorGot = $page.url.searchParams.get("error");
			if (!errorGot) return;
			if (hasKey(errorTypes, errorGot)) {
				toast.error(errorTypes[errorGot], {
					description: "Please try again later.",
					duration: 20000
				});
			}
		}
	});
</script>

<svelte:head>
	<title>InfoSections</title>
</svelte:head>

<Header loggedIn={data.user !== undefined} />
<Hero />
<Features />
<Stats />
<CTA />
