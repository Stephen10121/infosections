<script lang="ts">
	import { Toaster } from "@/components/ui/sonner";
	import { ModeWatcher, mode } from "mode-watcher";
	import logo from "../lib/assets/logo.png";
	import "./layout.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={logo} />
</svelte:head>

<ModeWatcher />
<Toaster theme={mode.current} />
{@render children?.()}
