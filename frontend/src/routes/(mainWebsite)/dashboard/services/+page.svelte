<script lang="ts">
	import FieldLabel from "@/components/FieldLabel.svelte";
	import Mono from "@/components/Mono.svelte";
	import { BookOpen, Plus } from "@lucide/svelte";
	import { getMyServices } from "../services.remote";
	import ServiceCard from "@/dashboard/services/ServiceCard.svelte";
	import * as Dialog from "@/components/ui/dialog/index";
	import { toast } from "svelte-sonner";
	import { deleteServiceCommand } from "./servicesActions.remote.js";
	import { Button } from "@/components/ui/button/index.js";
	import { onMount } from "svelte";
	import ServicePanel from "@/dashboard/services/ServicePanel.svelte";

	let { data } = $props();

	let deleteServiceId: string | null = $state(null);

	let openServicePanel = $state(false);
	let selectedServiceID = $state<string | undefined>();

	async function deleteService() {
		if (deleteServiceId === null) return;
		const deletingServiceToast = toast.loading("Deleting Service");
		const response = await deleteServiceCommand(deleteServiceId);
		toast.dismiss(deletingServiceToast);
		deleteServiceId = null;
		if (response.error) {
			toast.error(response.msg);
		} else {
			toast.success(response.msg);
		}
	}

	// afterNavigate(() => {
	// 	if (browser) {
	// 		if ($page.url.searchParams.get("new") === "1") {
	// 			console.log("bob");
	// 			setTimeout(() => {
	// 				createNewCalendar();
	// 			}, 500);
	// 		}
	// 		const expanded = $page.url.searchParams.get("expanded");
	// 		if (expanded !== null || expanded != "") {
	// 			selectedCalendarID = expanded!;
	// 			panelOpen = true;
	// 		}
	// 	}
	// });

	function newService() {
		// selectedServiceID = null;
		// openServicePanel = true;
	}

	onMount(() => {
		getMyServices().refresh();
	});
</script>

<svelte:head>
	<title>Services | InfoSections</title>
</svelte:head>

<!-- Delete Service Dialog -->
<Dialog.Root open={deleteServiceId !== null} onOpenChange={() => (deleteServiceId = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				<Mono class="text-xs text-muted-foreground">
					This action cannot be undone. This will permanently delete this service from our servers.
					All links relying on this service will not work.
				</Mono>
			</Dialog.Description>
			<Dialog.Footer>
				<Button variant="destructive" onclick={deleteService}>Confirm Delete</Button>
			</Dialog.Footer>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

<div
	class="flex-1 flex flex-col min-w-0 overflow-hidden"
	style="height: calc(100vh - 49px);
		height: calc(100dvh - 49px);"
>
	<div class="flex items-center gap-4 px-6 py-2.5 border-b border-border bg-background shrink-0">
		<FieldLabel>SERVICES</FieldLabel>
		<Mono class="text-[10px] text-muted-foreground hidden md:block"
			>Planning Center service plan overviews · shareable &amp; printable</Mono
		>
		<div class="flex-1"></div>
		<button
			onclick={newService}
			class="font-mono text-[10px] tracking-widest bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
			style="font-family: 'JetBrains Mono', monospace"
		>
			<Plus size={11} /> NEW SERVICE
		</button>
	</div>

	<div class="flex-1 overflow-y-auto p-6 space-y-3">
		{#if (await getMyServices()).length === 0}
			<div class="flex flex-col items-center justify-center gap-4 py-24 text-center">
				<div class="w-12 h-12 border border-border flex items-center justify-center text-border">
					<BookOpen size={20} />
				</div>
				<div>
					<Mono class="text-[11px] text-foreground block">No services yet</Mono>
					<Mono class="text-[10px] text-muted-foreground block mt-1"
						>Create a service overview to share plan details with your team and congregation.</Mono
					>
				</div>
				<button
					onclick={newService}
					class="px-4 py-2 border border-primary text-primary font-mono text-[10px] hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
					style="font-family: 'JetBrains Mono', monospace"
				>
					+ NEW SERVICE
				</button>
			</div>
		{:else}
			{#each await getMyServices() as item (item.id)}
				<ServiceCard
					pb_url={data.pb_url}
					{item}
					onEdit={() => {
						selectedServiceID = item.id;
						openServicePanel = true;
					}}
					onDelete={() => (deleteServiceId = item.id)}
				/>
			{/each}
		{/if}
	</div>

	<ServicePanel bind:open={openServicePanel} bind:serviceID={selectedServiceID} />
</div>
