<script lang="ts">
	import SheetHeader from "@/components/SheetHeader.svelte";
	import { motion } from "@humanspeak/svelte-motion";
	import Mono from "@/components/Mono.svelte";

	const items = [
		{ value: "50k+", label: "Calendar Views / Month", sub: "across all organizations" },
		{ value: "98%", label: "Customer Satisfaction", sub: "measured by NPS score" },
		{ value: "4", label: "Source Integrations", sub: "Planning Center + more" },
		{ value: "<2s", label: "Average Load Time", sub: "globally distributed CDN" }
	];
</script>

<section class="border-b border-border">
	<SheetHeader fig="FIG-002" label="METRICS" sheet="SHEET 02 / 06" />
	<div class="grid grid-cols-2 lg:grid-cols-4">
		{#each items as { value, label, sub }, i (i)}
			<motion.div
				key={i}
				initial={{ opacity: 0, y: 12 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: i * 0.08 }}
				class="px-8 py-12 border-r border-b lg:border-b-0 border-border last:border-r-0 group"
			>
				<div
					class="text-4xl font-black text-foreground mb-2 group-hover:text-primary transition-colors duration-300"
					style="font-family: Inter, sans-serif"
				>
					{value}
				</div>
				<Mono class="text-[11px] text-primary block mb-1">{label}</Mono>
				<Mono class="text-[10px] text-muted-foreground">{sub}</Mono>
			</motion.div>
		{/each}
	</div>
</section>
