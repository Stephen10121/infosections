<script lang="ts">
    import { LayoutList } from "@lucide/svelte";

    let { small = false }: { small?: boolean } = $props();
</script>

<div class="w-full h-full rounded-lg flex items-center justify-center bg-emerald-500/10">
    <LayoutList class="{small ? "h-4 w-4" : "h-7 w-7"} text-emerald-500" />
</div>