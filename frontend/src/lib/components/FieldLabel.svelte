<script lang="ts">
	import Mono from "./Mono.svelte";

	let { children } = $props();
</script>

<Mono class="text-[10px] tracking-widest text-muted-foreground uppercase"
	>{@render children?.()}</Mono
>
