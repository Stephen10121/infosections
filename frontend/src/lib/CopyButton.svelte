<script lang="ts">
	import { Check, Copy } from "@lucide/svelte";
	import { toast } from "svelte-sonner";

	let { text, label }: { text: string; label?: string } = $props();

	let copied = $state(false);
	function copy() {
		navigator.clipboard.writeText(text).catch(() => {});
		copied = true;
		toast.info("Copied text", { description: text, descriptionClass: "underline" });
		setTimeout(() => (copied = false), 2000);
	}
</script>

<button
	type="button"
	onclick={copy}
	class="flex items-center gap-1.5 border border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer shrink-0"
>
	{#if copied}<Check size={11} className="text-primary" />{:else}<Copy size={11} />{/if}
	{#if label}
		{label}
	{:else}
		{#if copied}COPIED{:else}COPY{/if}
	{/if}
</button>
