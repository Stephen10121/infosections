<script lang="ts">
	import { Calendar, ExternalLink, Filter } from "@lucide/svelte";
	import SheetHeader from "@/components/SheetHeader.svelte";
	import { motion } from "@humanspeak/svelte-motion";
	import Mono from "@/components/Mono.svelte";

	const features = [
		{
			num: "01",
			title: "Event Aggregation",
			desc: "Connect Planning Center and other sources. Every event flows into one normalized interface. No duplication, no manual entry, no drift.",
			tags: ["Planning Center", "Auto-sync", "Deduplication"],
			icon: Calendar
		},
		{
			num: "02",
			title: "Smart Filtering",
			desc: "Build sections with tag-based, location-based, and resource-based rules. Each audience sees exactly what belongs to them.",
			tags: ["Tag filters", "Location-aware", "Audience targeting"],
			icon: Filter
		},
		{
			num: "03",
			title: "Embeddable Calendars",
			desc: "Publish shareable, embeddable calendar views, event lists, image feeds. Embed on your site or share a direct link. Every update propagates in real time.",
			tags: ["Embed code", "Shareable links", "Real-time sync"],
			icon: ExternalLink
		}
	];
</script>

<section id="features" class="border-b border-border">
	<SheetHeader fig="FIG-003" label="FEATURES" sheet="SHEET 03 / 06" />
	<div class="grid lg:grid-cols-3">
		{#each features as { num, title, desc, tags, icon: Icon }, i (i)}
			<motion.div
				key={i}
				initial={{ opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: i * 0.1 }}
				class="px-8 md:px-10 py-14 border-r border-b lg:border-b-0 border-border last:border-r-0 group relative overflow-hidden"
			>
				<div class="flex items-start justify-between mb-8">
					<Mono
						class="text-6xl font-bold text-border/50 group-hover:text-primary/20 transition-colors duration-300 leading-none"
						>{num}</Mono
					>
					<div
						class="w-9 h-9 border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors duration-300 shrink-0"
					>
						<Icon size={15} />
					</div>
				</div>
				<h3 class="text-xl font-bold mb-4 tracking-tight" style="font-family: Inter, sans-serif">
					{title}
				</h3>
				<p
					class="text-sm text-muted-foreground leading-relaxed mb-8"
					style="font-family: Inter, sans-serif"
				>
					{desc}
				</p>
				<div class="flex flex-wrap gap-1.5">
					{#each tags as tag (tag)}
						<Mono class="text-[9px] px-2 py-0.5 bg-muted text-muted-foreground">{tag}</Mono>
					{/each}
				</div>
				<div
					class="absolute bottom-0 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-500"
				></div>
			</motion.div>
		{/each}
	</div>
</section>
