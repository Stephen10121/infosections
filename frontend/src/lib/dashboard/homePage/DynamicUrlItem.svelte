<script lang="ts">
	import { Badge } from "@/components/ui/badge";
	import { Link2 } from "@lucide/svelte";

	let {
		name,
		redirect,
		hits
	}: {
		name: string;
		redirect: number;
		hits: number;
	} = $props();
</script>

<div class="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
	<div class="flex items-center gap-3 min-w-0 flex-1">
		<div class="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
			<Link2 class="h-4 w-4 text-pink-400" />
		</div>
		<div class="min-w-0 flex-1">
			<p class="text-sm font-medium text-foreground">{name}</p>
			<p class="text-xs text-muted-foreground truncate">{redirect}</p>
		</div>
	</div>
	<Badge variant="secondary" class="text-xs shrink-0">
		{hits} hits
	</Badge>
</div>
