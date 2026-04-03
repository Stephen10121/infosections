<script lang="ts">
    import { X } from "@lucide/svelte";

    let showWarning = $state(true);
</script>

{#if showWarning}
    <div class="bg-ring/85 flex p-2 items-center justify-between">
        <p class="text-background">Warning. This website is currently in the alpha stage. Not all features are implemented yet.</p>
        <button class="text-background" onclick={() => showWarning = false}><X /></button>
    </div>
{/if}