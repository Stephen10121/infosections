<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { MoonIcon, SunIcon } from "@lucide/svelte";
	import { toggleMode } from "mode-watcher";
</script>

<nav class="bg-background/95 backdrop-blur-sm border-b border-border isolate z-50">
	<div class="w-full px-3 h-12 flex items-center justify-between">
		<div class="flex-1 relative flex items-center gap-3">
			<Sidebar.Trigger
				class="w-8.5 h-8.5 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors cursor-pointer"
			/>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={toggleMode}
				class="w-8.5 h-8.5 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors cursor-pointer"
			>
				<SunIcon
					size={12}
					class="scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					size={12}
					class="absolute scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
			</button>
		</div>
	</div>
</nav>
