<script lang="ts">
	import SheetHeader from "@/components/SheetHeader.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import { motion } from "@humanspeak/svelte-motion";
	import Mono from "@/components/Mono.svelte";

	const steps = [
		{
			num: "01",
			label: "CONNECT",
			title: "Link your sources",
			desc: "Connect Planning Center, Google Calendar, or your existing system in minutes. OAuth-based, no manual export."
		},
		{
			num: "02",
			label: "CONFIGURE",
			title: "Build sections",
			desc: "Name your sections and set filter rules. Tag-based, resource-based, or room-based, composable and instant."
		},
		{
			num: "03",
			label: "PUBLISH",
			title: "Share everywhere",
			desc: "Embed the calendar, event list or image feed on your site or share a direct link. Every event update propagates automatically."
		}
	];
</script>

<section class="border-b border-border">
	<SheetHeader fig="FIG-004" label="PROCESS" sheet="SHEET 04 / 06" />
	<div class="grid lg:grid-cols-3">
		{#each steps as { num, label, title, desc }, i (i)}
			<motion.div
				key={i}
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: i * 0.12 }}
				class="px-8 md:px-10 py-14 border-r border-b lg:border-b-0 border-border last:border-r-0 relative overflow-hidden"
			>
				<Mono
					class="absolute top-5 right-6 text-8xl font-black text-border/20 leading-none select-none pointer-events-none"
					>{num}</Mono
				>
				<div class="relative">
					<div class="flex items-center gap-2 mb-5">
						<div class="w-1.5 h-1.5 bg-primary shrink-0"></div>
						<FieldLabel>{label}</FieldLabel>
					</div>
					<h3 class="text-2xl font-bold mb-4 tracking-tight" style="font-family: Inter, sans-serif">
						{title}
					</h3>
					<p
						class="text-sm text-muted-foreground leading-relaxed"
						style="font-family: Inter, sans-serif"
					>
						{desc}
					</p>
				</div>
			</motion.div>
		{/each}
	</div>
</section>
