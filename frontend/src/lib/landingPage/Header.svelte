<script lang="ts">
	import { MoonIcon, SunIcon } from "@lucide/svelte";
	import Mono from "@/components/Mono.svelte";
	import { toggleMode } from "mode-watcher";

	let { loggedIn }: { loggedIn: boolean } = $props();
</script>

<nav
	class="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
>
	<div class="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Mono
				class="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 leading-none"
				>IS</Mono
			>
			<Mono class="text-xs font-medium text-foreground">infosections</Mono>
		</div>

		<div class="hidden md:flex items-center gap-1">
			{#each ["Features", "Pricing", "Docs"] as link (link)}
				<a
					href={`#${link.toLowerCase()}`}
					class="font-mono text-[10px] tracking-widest px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
					style="font-family: 'JetBrains Mono', monospace"
				>
					{link.toUpperCase()}
				</a>
			{/each}
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={toggleMode}
				class="w-7 h-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors cursor-pointer"
			>
				<SunIcon
					size={12}
					class="scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					size={12}
					class="absolute scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
			</button>
			{#if loggedIn}
				<a
					href="/dashboard"
					class="font-mono text-[10px] tracking-widest border border-primary text-primary px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
					style="font-family: 'JetBrains Mono', monospace"
				>
					Dashboard
				</a>
			{:else}
				<div class="flex gap-3 items-center">
					<a
						href="/signup"
						class="font-mono text-[10px] tracking-widest border border-primary text-primary px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
						style="font-family: 'JetBrains Mono', monospace"
					>
						Get Started
					</a>
					<a
						href="/login"
						class="font-mono text-[10px] tracking-widest border border-border text-muted-foreground px-3 py-1.5 hover:text-foreground hover:border-foreground/25 transition-colors flex items-center gap-1.5 cursor-pointer"
						style="font-family: 'JetBrains Mono', monospace"
					>
						Login
					</a>
				</div>
			{/if}
		</div>
	</div>
</nav>
