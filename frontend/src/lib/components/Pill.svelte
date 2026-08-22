<script lang="ts">
	import { X } from "@lucide/svelte";

	let { label, onRemove }: { label: string; onRemove: () => void } = $props();
</script>

<span
	class="inline-flex items-center gap-1 bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
>
	#{label}
	<button type="button" onclick={onRemove} class="hover:text-foreground cursor-pointer">
		<X size={9} />
	</button>
</span>
