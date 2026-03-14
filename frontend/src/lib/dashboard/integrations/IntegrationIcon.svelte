<script lang="ts">
    import { cn, type IntegrationModel } from "@/utils";
    import type { ClassValue } from "svelte/elements";

    let { class: className = "", icon }: { icon: IntegrationModel["service"], class?: ClassValue } = $props();

    const iconColors: Record<string, string> = {
        planningcenter: "bg-blue-500",
        breeze: "bg-teal-500",
        google: "bg-red-500",
        outlook: "bg-blue-600",
    }

    const iconLetters: Record<string, string> = {
        planningcenter: "PC",
        breeze: "B",
        google: "G",
        outlook: "O",
    }
</script>

<div
    class={cn(
    "flex items-center justify-center rounded-md text-white font-semibold text-xs",
    iconColors[icon] || "bg-muted",
    className
    )}
>
    {iconLetters[icon] || "?"}
</div>