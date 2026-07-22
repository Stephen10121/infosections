<script lang="ts">
	import { Badge } from "@/components/ui/badge";
	import { cn, type IntegrationModel } from "@/utils";
	import { AlertCircle, CheckCircle2, Cloud, Loader2, type IconProps } from "@lucide/svelte";
	import type { Component } from "svelte";
	import type { ClassValue } from "svelte/elements";

	let { status }: { status: IntegrationModel["status"] } = $props();

	const statusConfig: {
		[key: string]: {
			label: string;
			variant: "default" | "secondary" | "destructive" | "outline";
			icon: Component<IconProps, {}, "">;
			className: ClassValue;
		};
	} = {
		connected: {
			label: "Synced",
			variant: "default" as const,
			icon: CheckCircle2,
			className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
		},
		syncing: {
			label: "Syncing",
			variant: "secondary" as const,
			icon: Loader2,
			className: "bg-blue-500/10 text-blue-500 border-blue-500/20"
		},
		error: {
			label: "Error",
			variant: "destructive" as const,
			icon: AlertCircle,
			className: "bg-red-500/10 text-red-500 border-red-500/20"
		},
		disconnected: {
			label: "Disconnected",
			variant: "outline" as const,
			icon: Cloud,
			className: "bg-muted text-muted-foreground"
		}
	};

	let config = $derived(statusConfig[status]);
</script>

{#if config}
	<Badge variant={config.variant} class={cn("text-[10px] px-1.5 py-0 h-5 gap-1", config.className)}>
		<config.icon class={cn("h-3 w-3", status === "syncing" && "animate-spin")} />
		{config.label}
	</Badge>
{/if}
