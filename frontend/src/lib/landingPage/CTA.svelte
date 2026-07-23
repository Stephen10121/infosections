<script>
	import SheetHeader from "@/components/SheetHeader.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import { ArrowRight } from "@lucide/svelte";
</script>

<section id="pricing" class="border-b border-border">
	<SheetHeader fig="FIG-005" label="CTA" sheet="SHEET 05 / 06" />
	<div class="grid lg:grid-cols-2">
		<div class="px-8 md:px-16 py-20 border-r border-b lg:border-b-0 border-border">
			<FieldLabel>READY TO START?</FieldLabel>
			<h2
				class="text-4xl md:text-5xl font-extrabold mt-5 mb-6 tracking-tight leading-none"
				style="font-family: Inter, sans-serif"
			>
				Your first calendar<br />in <span class="text-primary">minutes</span>
			</h2>
			<p
				class="text-sm text-muted-foreground mb-10 leading-relaxed max-w-xs"
				style="font-family: Inter, sans-serif"
			>
				Free 14-day trial, no credit card required. Connect, configure, and publish.
			</p>
			<div class="flex flex-col sm:flex-row gap-3">
				<a
					href="/signup?free_trial=1"
					class="font-mono text-[11px] tracking-widest bg-primary text-primary-foreground px-6 py-3.5 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
					style="font-family: 'JetBrains Mono', monospace"
					>START FREE TRIAL <ArrowRight size={12} /></a
				>
				<a
					href="mailto:sales@infosections.com"
					class="font-mono text-[11px] text-center tracking-widest border border-border text-foreground px-6 py-3.5 hover:border-foreground/40 transition-colors cursor-pointer"
					style="font-family: 'JetBrains Mono', monospace">CONTACT SALES</a
				>
			</div>
		</div>
		<div class="px-8 md:px-16 py-20 bg-card/30">
			<FieldLabel>INCLUDED IN FREE TRIAL</FieldLabel>
			<ul class="mt-7 space-y-4">
				{#each ["Unlimited calendar sections", "Planning Center integration", "Custom tag & resource/room filtering", "Public embed links", "Real-time event sync", "14 days full access, no credit card"] as item (item)}
					<li class="flex items-center gap-3">
						<div class="w-1.5 h-1.5 bg-primary shrink-0"></div>
						<span class="text-sm text-foreground" style="font-family: Inter, sans-serif"
							>{item}</span
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
