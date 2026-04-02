<script lang="ts">
    import Features from "@/landingPage/Features.svelte";
    import Header from "@/landingPage/Header.svelte";
    import Stats from "@/landingPage/Stats.svelte";
    import Hero from "@/landingPage/Hero.svelte";
    import CTA from "@/landingPage/CTA.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>InfoSections</title>
</svelte:head>

<Header loggedIn={data.user!==undefined} />
<Hero />
<Features />
<Stats />
<CTA />