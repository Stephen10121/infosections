<script lang="ts">
	import Mono from "@/components/Mono.svelte";
	import { cn } from "@/utils";
	import { Unlock, Lock } from "@lucide/svelte";
	import type { RemoteFormIssue } from "@sveltejs/kit";
	import type { HTMLInputAttributes } from "svelte/elements";

	interface Props extends HTMLInputAttributes {
		error: RemoteFormIssue[] | undefined;
		type: HTMLInputAttributes["type"];
		label: string;
	}

	let { error, type, label, ...restProps }: Props = $props();

	let show = $state(false);
	let isPassword = $derived(type === "password");
</script>

<div>
	<label class="block mb-1.5">
		<Mono class="text-[10px] text-muted-foreground">{label}</Mono>
	</label>
	<div class="relative">
		<input
			type={isPassword && show ? "text" : type}
			{...restProps}
			class={cn(
				"w-full border bg-transparent px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors",
				error && error.length > 0
					? "border-destructive focus:border-destructive"
					: "border-border focus:border-primary"
			)}
			style="font-family: 'JetBrains Mono', monospace"
		/>
		{#if isPassword}
			<button
				type="button"
				onclick={() => (show = !show)}
				class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
			>
				{#if show}<Unlock size={13} />{:else}<Lock size={13} />{/if}
			</button>
		{/if}
	</div>
	{#if error && error.length > 0}
		{#each error as anError (anError)}
			<Mono class="text-[10px] text-destructive mt-1 block">{anError.message}</Mono>
		{/each}
	{/if}
</div>
