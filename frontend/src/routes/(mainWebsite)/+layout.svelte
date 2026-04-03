<script lang="ts">
	let { children } = $props();
</script>

<main class="min-h-screen">
	{@render children?.()}
</main>
