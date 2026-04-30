<script lang="ts">
    import { cn, type IntegrationModel } from "@/utils";
    import { Flag } from "@lucide/svelte";
    import type { ClassValue } from "svelte/elements";

    let { class: className = "", icon }: { icon: IntegrationModel["service"], class?: ClassValue } = $props();

    const iconColors: Record<string, string> = {
        planningcenter: "bg-blue-500",
        breeze: "bg-teal-500",
        google: "bg-red-500",
        twitter: "bg-black",
    }

    const iconLetters: Record<string, string> = {
        planningcenter: "PC",
        breeze: "B",
        google: "G",
        twitter: "O",
    }
</script>

<div
    class={cn(
    "flex items-center justify-center rounded-md text-white font-semibold text-xs",
    iconColors[icon] || "bg-muted",
    className
    )}
>
    {#if icon === "planningcenter"}
        <Flag class="w-4 h-4" />
    {:else if icon === "twitter"}
        <svg role="img" viewBox="0 0 24 24" class="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
            <title>X</title>
            <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
        </svg>
    {:else}
        {iconLetters[icon] || "?"}
    {/if}
</div>