<script lang="ts">
    import { Toaster } from "@/components/ui/sonner";
	import favicon from "../lib/assets/logo.png";
	import "../app.css";
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster theme="light" />
{@render children?.()}
