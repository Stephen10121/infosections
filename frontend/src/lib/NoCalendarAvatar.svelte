<script lang="ts">
	import { CalendarDays } from "@lucide/svelte";

	let { small = false }: { small?: boolean } = $props();
</script>

<div class="w-full h-full rounded-lg flex items-center justify-center bg-violet-500/10">
	<CalendarDays class="{small ? 'h-4 w-4' : 'h-7 w-7'} text-violet-500" />
</div>
