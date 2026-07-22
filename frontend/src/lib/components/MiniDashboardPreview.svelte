<script lang="ts">
	import { cn } from "@/utils";
	import Mono from "./Mono.svelte";
</script>

<div>
	<div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/80">
		<Mono class="text-[10px] text-primary font-semibold">infosections · dashboard</Mono>
		<div class="flex gap-1.5">
			<div class="w-2.5 h-2.5 rounded-full bg-destructive/50"></div>
			<div class="w-2.5 h-2.5 rounded-full bg-primary/40"></div>
			<div class="w-2.5 h-2.5 rounded-full bg-primary/70"></div>
		</div>
	</div>
	<div class="grid grid-cols-3 border-b border-border">
		{#each [["EVENTS", "2,847"], ["VIEWS", "54.2k"], ["ACTIVE", "38"]] as label, val (label)}
			<div class="px-4 py-3 border-r border-border last:border-r-0">
				<Mono class="text-[9px] text-muted-foreground block">{label}</Mono>
				<span
					class="font-bold text-xl text-foreground leading-none mt-1 block"
					style="font-family: 'Inter', sans-serif">{val}</span
				>
			</div>
		{/each}
	</div>
	<div>
		{#each [{ name: "Sunday Service", tag: "worship", status: "ACTIVE" }, { name: "Youth Group Meeting", tag: "youth", status: "ACTIVE" }, { name: "Community Food Drive", tag: "community", status: "UPCOMING" }, { name: "Annual Gala", tag: "fundraiser", status: "UPCOMING" }, { name: "Bible Study", tag: "study", status: "ACTIVE" }] as evt, i (i)}
			<div
				class={cn(
					"flex items-center justify-between px-4 py-2.5 border-b border-border/60 last:border-b-0",
					i % 2 === 0 ? "bg-card/20" : ""
				)}
			>
				<div class="min-w-0 mr-3">
					<Mono class="text-[11px] text-foreground font-medium block truncate">{evt.name}</Mono>
					<Mono class="text-[9px] text-muted-foreground">#{evt.tag}</Mono>
				</div>
				<Mono
					class={cn(
						"text-[9px] px-2 py-0.5 shrink-0",
						evt.status === "ACTIVE"
							? "bg-primary/15 text-primary"
							: "bg-muted text-muted-foreground"
					)}
				>
					{evt.status}
				</Mono>
			</div>
		{/each}
	</div>
</div>
