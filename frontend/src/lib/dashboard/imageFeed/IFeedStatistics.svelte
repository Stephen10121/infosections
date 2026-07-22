<script lang="ts">
	import * as Card from "@/components/ui/card/index";
	import { Temporal } from "temporal-polyfill";
	import PrettyDate from "@/PrettyDate.svelte";

	let {
		visits,
		created,
		updated,
		timeZone
	}: {
		visits: number;
		created: string;
		updated: string;
		timeZone: string;
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Statistics</Card.Title>
		<Card.Description>Image Feed performance</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="space-y-2">
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Visits</span>
				<span class="font-semibold text-foreground">{visits}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Created</span>
				<span class="font-semibold text-foreground"
					><PrettyDate date={Temporal.Instant.from(created).toZonedDateTimeISO(timeZone)} /></span
				>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Updated</span>
				<span class="font-semibold text-foreground"
					><PrettyDate date={Temporal.Instant.from(updated).toZonedDateTimeISO(timeZone)} /></span
				>
			</div>
		</div>
	</Card.Content>
</Card.Root>
