<script lang="ts">
	import FieldLabel from "@/components/FieldLabel.svelte";
	import Mono from "@/components/Mono.svelte";
	import SheetHeader from "@/components/SheetHeader.svelte";
	import { ChevronRight } from "@lucide/svelte";
</script>

<footer>
	<SheetHeader fig="FIG-006" label="FOOTER" sheet="SHEET 06 / 06" />
	<div class="grid lg:grid-cols-3 border-b border-border">
		<div class="px-8 md:px-10 py-10 border-r border-b lg:border-b-0 border-border">
			<div class="flex items-center gap-2 mb-5">
				<Mono
					class="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 leading-none"
					>IS</Mono
				><Mono class="text-xs font-medium">infosections</Mono>
			</div>
			<p
				class="text-xs text-muted-foreground leading-relaxed mb-6"
				style="font-family: Inter, sans-serif"
			>
				Unified view of every event, sortable by location, tags, and custom filters so you can focus
				on what's happening, where it matters.
			</p>
			<div class="flex gap-2 flex-wrap">
				{#each ["SvelteKit", "PocketBase", "Go"] as t (t)}<Mono
						class="text-[9px] px-2 py-0.5 bg-muted text-muted-foreground">{t}</Mono
					>{/each}
			</div>
		</div>
		<div class="px-8 md:px-10 py-10 border-r border-b lg:border-b-0 border-border">
			<FieldLabel>PRODUCT</FieldLabel>
			<ul class="mt-4 space-y-2.5">
				{#each ["Features", "Pricing", "Changelog", "Docs", "Status"] as link (link)}<li>
						<a
							href="/"
							class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
							style="font-family: Inter, sans-serif"
							><ChevronRight
								size={10}
								class="text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
							/>{link}</a
						>
					</li>{/each}
			</ul>
		</div>
		<div class="px-8 md:px-10 py-10">
			<FieldLabel>COMPANY</FieldLabel>
			<ul class="mt-4 space-y-2.5">
				{#each ["About", "Blog", "GitHub", "Contact", "Privacy"] as link (link)}<li>
						<a
							href="/"
							class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
							style="font-family: Inter, sans-serif"
							><ChevronRight
								size={10}
								class="text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
							/>{link}</a
						>
					</li>{/each}
			</ul>
		</div>
	</div>
	<div class="px-8 py-4 flex items-center justify-between">
		<FieldLabel
			>© {new Date().getFullYear()} InfoSections ·
			<a href="https://stephengruzin.dev" class="underline" target="_blank">Stephen Gruzin</a
			></FieldLabel
		>
		<FieldLabel>MIT LICENSE</FieldLabel>
	</div>
</footer>
