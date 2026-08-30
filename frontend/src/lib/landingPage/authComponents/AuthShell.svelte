<script lang="ts">
	import FieldLabel from "@/components/FieldLabel.svelte";
	import Mono from "@/components/Mono.svelte";
	import type { Snippet } from "svelte";

	let { children, title, sub }: { children: Snippet; title: string; sub: string } = $props();
</script>

<div class="min-h-screen bg-background flex">
	<div
		class="hidden lg:flex lg:w-105 shrink-0 flex-col border-r border-border bg-card/30 relative overflow-hidden"
	>
		<div
			class="absolute inset-0 pointer-events-none opacity-[0.035]"
			style="background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px);background-size: 40px 40px"
		></div>
		<Mono class="absolute top-4 left-5 text-[9px] text-muted-foreground/30 select-none"
			>-200, -120</Mono
		>
		<Mono class="absolute bottom-4 right-5 text-[9px] text-muted-foreground/30 select-none"
			>+200, +120</Mono
		>

		<div class="relative flex flex-col h-full p-10 justify-between">
			<a href="/" class="flex items-center gap-2">
				<Mono
					class="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 leading-none"
					>IS</Mono
				>
				<Mono class="text-xs font-medium text-foreground">infosections</Mono>
			</a>

			<div>
				<div class="flex items-center gap-2 mb-6">
					<div class="h-px w-6 bg-primary"></div>
					<FieldLabel>UNIFIED EVENT INTELLIGENCE</FieldLabel>
				</div>
				<h2
					class="text-4xl font-extrabold leading-tight tracking-tight mb-5"
					style="font-family: Inter, sans-serif"
				>
					The smarter way to
					<br /><span class="text-primary">share your events</span>
				</h2>
				<p
					class="text-sm text-muted-foreground leading-relaxed mb-8"
					style="font-family: Inter, sans-serif"
				>
					Connect Planning Center, create embeddable calendars, image feeds, and event lists —
					filtered exactly for your audience.
				</p>

				<div class="space-y-3">
					{#each ["Planning Center integration", "Time-based dynamic URLs", "Password-protected sharing", "Ref tracking & analytics"] as f (f)}
						<div class="flex items-center gap-3">
							<div class="w-1.5 h-1.5 bg-primary shrink-0"></div>
							<span class="text-xs text-muted-foreground" style="font-family: Inter, sans-serif"
								>{f}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="pt-6 border-t border-border">
				<div class="grid grid-cols-3 gap-4">
					{#each [["50k+", "Monthly views"], ["98%", "Satisfaction"], ["6", "Integrations"]] as [v, l] (l)}
						<div>
							<div
								class="text-xl font-black text-foreground"
								style="font-family: Inter, sans-serif"
							>
								{v}
							</div>
							<Mono class="text-[9px] text-muted-foreground">{l}</Mono>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="flex-1 flex flex-col items-center justify-center p-8 min-h-screen">
		<div class="w-full max-w-95">
			<a href="/" class="flex items-center gap-2 mb-8 lg:hidden">
				<Mono
					class="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 leading-none"
					>IS</Mono
				>
				<Mono class="text-xs font-medium text-foreground">infosections</Mono>
			</a>

			<div class="mb-7">
				<h1
					class="text-2xl font-extrabold text-foreground tracking-tight"
					style="font-family: Inter, sans-serif"
				>
					{title}
				</h1>
				<p class="text-sm text-muted-foreground mt-1" style="font-family: Inter, sans-serif">
					{sub}
				</p>
			</div>

			{@render children?.()}
		</div>
	</div>
</div>
