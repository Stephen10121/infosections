<script lang="ts">
	import { Link2 } from "@lucide/svelte";

	let { small = false }: { small?: boolean } = $props();
</script>

<div class="w-full h-full rounded-lg flex items-center justify-center bg-pink-500/10">
	<Link2 class="{small ? 'h-4 w-4' : 'h-7 w-7'} text-pink-400" />
</div>
