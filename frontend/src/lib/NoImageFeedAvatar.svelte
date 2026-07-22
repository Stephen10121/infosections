<script lang="ts">
	import { ImageIcon } from "@lucide/svelte";

	let { small = false }: { small?: boolean } = $props();
</script>

<div class="w-full h-full rounded-lg flex items-center justify-center bg-amber-500/10">
	<ImageIcon class="{small ? 'h-4 w-4' : 'h-7 w-7'} text-amber-500" />
</div>
