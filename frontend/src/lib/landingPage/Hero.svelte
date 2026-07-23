<script lang="ts">
	import MiniDashboardPreview from "@/components/MiniDashboardPreview.svelte";
	import SheetHeader from "@/components/SheetHeader.svelte";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import { WindowManager, Window } from "svelte-windows";
	import { motion } from "@humanspeak/svelte-motion";
	import { ArrowRight } from "@lucide/svelte";
	import Mono from "@/components/Mono.svelte";

	let win1Active = $state(false);
	let win2Active = $state(false);
</script>

<section class="min-h-screen pt-12 flex flex-col border-b border-border">
	<SheetHeader fig="FIG-001" label="HERO" sheet="SHEET 01 / 06" />
	<div class="flex-1 grid lg:grid-cols-2">
		<div
			class="flex flex-col justify-between p-8 md:p-14 lg:p-20 border-b lg:border-b-0 lg:border-r border-border"
		>
			<div>
				<div class="flex items-center gap-2 mb-10">
					<div class="h-px w-8 bg-primary shrink-0"></div>
					<FieldLabel>PRODUCT OVERVIEW · {new Date().getFullYear()}</FieldLabel>
				</div>
				<motion.h1
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
					class="text-[3.5rem] md:text-[5rem] font-extrabold leading-none tracking-tight mb-8"
					style={{ fontFamily: "Inter, sans-serif" }}
				>
					View events<br /><span class="text-primary">the better way!</span>
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.15 }}
					class="text-base text-muted-foreground leading-relaxed max-w-sm mb-10"
					style={{ fontFamily: "Inter, sans-serif" }}
				>
					We offer a unified view of every event, sortable by location, tags, and custom filters so
					you can focus on what's happening, where it matters.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					class="flex flex-wrap items-center gap-3"
				>
					<a
						href="/signup?free_trial=1"
						class="font-mono text-[11px] tracking-widest bg-primary text-primary-foreground px-6 py-3 hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
						style="font-family: 'JetBrains Mono', monospace"
					>
						START FREE TRIAL <ArrowRight size={12} />
					</a>
				</motion.div>
			</div>
			<div class="mt-16 pt-6 border-t border-border grid grid-cols-3 gap-6">
				{#each [{ label: "pkg ·", value: "infosections" }, { label: "version ·", value: "2.1.0" }, { label: "status ·", value: "stable" }] as { label, value } (label)}
					<div>
						<Mono class="text-[9px] text-muted-foreground block">{label}</Mono>
						<Mono class="text-[11px] text-foreground mt-0.5 block">{value}</Mono>
					</div>
				{/each}
			</div>
		</div>
		<div class="relative flex items-center justify-center p-8 md:p-12 overflow-hidden bg-card/20">
			<div
				class="absolute inset-0 pointer-events-none opacity-[0.035]"
				style="background-image: linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px);background-size: 40px 40px"
			></div>
			<Mono class="absolute top-4 left-5 text-[9px] text-muted-foreground/35 select-none"
				>-200, -120</Mono
			>
			<Mono class="absolute top-4 right-5 text-[9px] text-muted-foreground/35 select-none"
				>+200, -120</Mono
			>
			<Mono class="absolute bottom-4 left-5 text-[9px] text-muted-foreground/35 select-none"
				>-200, +120</Mono
			>
			<Mono class="absolute bottom-4 right-5 text-[9px] text-muted-foreground/35 select-none"
				>+200, +120</Mono
			>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
				class="absolute top-0 left-0 w-full h-full"
			>
				<div style="width: 100%;height:100%">
					<WindowManager>
						{#snippet children(context)}
							<Window
								onActiveStateChanged={(active) => {
									win1Active = active;
								}}
								top="50px"
								left="50px"
								outerClassName="border border-border bg-background"
								outerStyle="box-shadow: 0 32px 64px rgba(0,0,0,0.12)"
								id="window1"
								resizeWhenInactive
								height="407px"
								width="400px"
								{context}
								windowDragRegions={[{ width: "100%", height: "36px", top: "0px", left: "0px" }]}
							>
								<MiniDashboardPreview />
								{#if !win1Active}
									<div
										class="absolute top-0 left-0 w-full h-full pointer-events-none bg-gray-100/30 dark:bg-black/30"
									></div>
								{/if}
							</Window>

							<Window
								onActiveStateChanged={(active) => {
									win2Active = active;
								}}
								outerClassName="border border-border bg-background"
								outerStyle="box-shadow: 0 32px 64px rgba(0,0,0,0.12)"
								id="window2"
								top="125px"
								left="100px"
								resizeWhenInactive
								height="407px"
								{context}
								windowDragRegions={[{ width: "100%", height: "36px", top: "0px", left: "0px" }]}
							>
								<MiniDashboardPreview />
								{#if !win2Active}
									<div
										class="absolute top-0 left-0 w-full h-full pointer-events-none bg-gray-100/30 dark:bg-black/30"
									></div>
								{/if}
							</Window>
						{/snippet}
					</WindowManager>
				</div>
			</motion.div>
		</div>
	</div>
</section>
