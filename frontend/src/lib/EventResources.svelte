<script lang="ts">
	import type { EventDBModelExpanded } from "./event.utils";
	import { Package, Warehouse } from "@lucide/svelte";

	let {
		resources,
		showResourcePathname,
		showResources,
		showRooms,
		fontScale
	}: {
		resources: EventDBModelExpanded["expand"]["resources"];
		showResourcePathname: boolean;
		showResources: boolean;
		showRooms: boolean;
		fontScale: number;
	} = $props();

	let res: Exclude<EventDBModelExpanded["expand"]["resources"], null> = $state([]);
	let rooms: Exclude<EventDBModelExpanded["expand"]["resources"], null> = $state([]);

	$effect(() => {
		if (resources && resources !== null) {
			try {
				res = resources.filter((resource) => resource.kind === "Resource");
				rooms = resources.filter((resource) => resource.kind === "Room");
			} catch (err) {
				console.log(err);
			}
		}
	});
</script>

{#if rooms.length > 0 && showRooms}
	<div class="flex items-start gap-2 text-gray-400" style="font-size: {fontScale * 14}px;">
		<Warehouse class="h-4 w-4 mt-0.5 shrink-0" />
		<p>
			<span class="text-gray-400"
				>Room{#if rooms.length > 1}s{/if}:</span
			>
			<span class="text-gray-300">
				{#each rooms as room, index}
					{#if room.path_name}{room.path_name}\\{/if}
					{room.name}{#if index + 1 < rooms.length},
					{/if}
				{/each}
			</span>
		</p>
	</div>
{/if}

{#if res.length > 0 && showResources}
	<div class="flex items-start gap-2 text-gray-400" style="font-size: {fontScale * 14}px;">
		<Package class="h-4 w-4 mt-0.5 shrink-0" />
		<p>
			<span class="text-gray-400"
				>Resource{#if res.length > 1}s{/if}:</span
			>
			<span class="text-gray-300">
				{#each res as resource, index}
					{resource.name}{#if resource.path_name && showResourcePathname}<span class="pl-1"
							>({resource.path_name.trimEnd()})</span
						>{/if}{#if index + 1 < res.length}<span class="pr-1">, </span>
					{/if}
				{/each}
			</span>
		</p>
	</div>
{/if}
