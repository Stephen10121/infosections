<script lang="ts">
	import { createCalendarCommand, deleteCalendarCommand } from "./calendarActions.remote.js";
	import { CalendarDays, Plus, Search } from "@lucide/svelte";
	import { Button } from "@/components/ui/button";
	import * as Dialog from "@/components/ui/dialog/index";
	import { getMyCalendars } from "../backend.remote.js";
	import { afterNavigate } from "$app/navigation";
	import { browser } from "$app/environment";
	import { toast } from "svelte-sonner";
	// import { page } from "$app/stores";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import Mono from "@/components/Mono.svelte";
	import { AnimatePresence } from "@humanspeak/svelte-motion";
	import CalItemCard from "@/dashboard/calendar/CalItemCard.svelte";
	import { onMount } from "svelte";
	import CalendarPanel from "@/dashboard/calendar/CalendarPanel.svelte";
	import { Label } from "@/components/ui/label/index.js";
	import { Input } from "@/components/ui/input/index.js";
	import { Textarea } from "@/components/ui/textarea/index.js";
	import { Switch } from "@/components/ui/switch/index.js";
	import { Spinner } from "@/components/ui/spinner/index.js";
	// import { getMyEventResourcesPrivate, getMyEventTagsPrivate } from "../events.remote.js";

	let { data } = $props();

	let newCalendarDialogOpen = $state(false);

	// let myTagsPromise = $derived(getMyEventTagsPrivate());
	// let myResourcesPromise = $derived(getMyEventResourcesPrivate());

	// let myTags = $derived(await myTagsPromise);
	// let myResources = $derived(await myResourcesPromise);

	let newCalendarDescription = $state("");
	let newCalendarPublicId = $state("");
	let newCalendarName = $state("");
	let newCalendarPasswordEnabled = $state(false);
	let newCalendarPassword = $state("");
	let creatingCalendar = $state(false);

	async function handleCreateCalendar() {
		if (newCalendarPublicId && newCalendarName && newCalendarDescription) {
			creatingCalendar = true;
			const response = await createCalendarCommand({
				publicId: newCalendarPublicId,
				name: newCalendarName,
				description: newCalendarDescription,
				enablePassword: newCalendarPasswordEnabled,
				newPassword: newCalendarPassword
			});
			creatingCalendar = false;
			if (response.error) {
				toast.error(response.msg);
			} else {
				toast.success(response.msg);
				newCalendarDialogOpen = false;
				newCalendarDescription = "";
				newCalendarPublicId = "";
				newCalendarName = "";
				newCalendarPasswordEnabled = false;
				newCalendarPassword = "";
			}
		} else {
			toast.error("Missing Fields.");
		}
	}

	// function copyCalLinkToClipboard(id: string) {
	// 	const link = `${window.location.origin}/cal/${id}`;

	// 	navigator.clipboard.writeText(link);

	// 	toast.info("Copied", {
	// 		description: link,
	// 		descriptionClass: "underline"
	// 	});
	// }

	let deleteCalendarId: string | null = $state(null);

	async function deleteCal() {
		if (deleteCalendarId === null) return;
		const deletingCalendar = toast.loading("Deleting Calendar");
		const response = await deleteCalendarCommand(deleteCalendarId);
		toast.dismiss(deletingCalendar);
		deleteCalendarId = null;
		if (response.error) {
			toast.error(response.msg);
		} else {
			toast.success(response.msg);
		}
	}

	afterNavigate(() => {
		if (browser) {
			// newCalendarDialogOpen = $page.url.searchParams.get("new") === "1";
		}
	});

	function createNewCalendar() {
		console.log("New Calendar");
		newCalendarDialogOpen = true;
	}

	let calendarSearch = $state("");
	let filtered = $derived(
		(await getMyCalendars()).filter(
			(item) =>
				item.name.toLowerCase().includes(calendarSearch.toLowerCase()) ||
				item.description.toLowerCase().includes(calendarSearch.toLowerCase())
		)
	);

	onMount(() => {
		getMyCalendars().refresh();
	});

	let panelOpen = $state(false);
	let selectedCalendarID: string | undefined = $state();
</script>

<svelte:head>
	<title>My Calendars | InfoSections</title>
</svelte:head>

<!-- <div class="w-full h-full space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">My Calendars</h1>
			<p class="text-muted-foreground mt-1">
				Customisable calendars that can be accessed anywhere by anyone (Unless it's password
				protected.)
			</p>
		</div>

		<Dialog.Root bind:open={newCalendarDialogOpen}>
			<Dialog.Trigger class={cn(buttonVariants({ variant: "default" }), "gap-2")}>
				<Plus class="h-4 w-4" />
				New Calendar
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-125">
				<Dialog.Header>
					<Dialog.Title>Create New Calendar</Dialog.Title>
					<Dialog.Description
						>You can change more settings after creating the calendar.</Dialog.Description
					>
				</Dialog.Header>

				<div class="space-y-4 py-4">
					<div class="space-y-2">
						<Label for="name">Calendar URL path</Label>
						<Input
							id="publicId"
							placeholder="e.g., publishedevents"
							bind:value={newCalendarPublicId}
						/>
					</div>

					<div class="space-y-2">
						<Label for="name">Calendar Name</Label>
						<Input id="name" placeholder="e.g., Published Events" bind:value={newCalendarName} />
					</div>

					<div class="space-y-2">
						<Label for="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Brief description of this calendar type"
							bind:value={newCalendarDescription}
							rows={3}
						/>
					</div>
					<div class="flex items-center justify-between">
						<div class="space-y-0.5">
							<Label for="password-protection" class="text-base">Password Protection</Label>
							<p class="text-sm text-muted-foreground">
								Require a password to access this calendar
							</p>
						</div>
						<Switch id="password-protection" bind:checked={newCalendarPasswordEnabled} />
					</div>

					{#if newCalendarPasswordEnabled}
						<div class="space-y-2 pt-2">
							<Label for="password">Calendar Password</Label>
							<Input
								id="password"
								bind:value={newCalendarPassword}
								type="password"
								placeholder="Enter password"
							/>
						</div>
					{/if}
				</div>

				<Dialog.Footer>
					<Button variant="outline" onclick={() => (newCalendarDialogOpen = false)}>Cancel</Button>
					<Button onclick={handleCreateCalendar}>
						{#if creatingCalendar}
							<Spinner />
							Creating Calendar...
						{:else}
							Create Calendar
						{/if}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="w-full h-full grid gap-4 xl:grid-cols-3 relative">
		{#if (await getMyCalendars()).length === 0}
			<p class="absolute top-3 left-1/2 -translate-1/2 text-muted-foreground">No Calendars Yet.</p>
		{/if}
		{#each await getMyCalendars() as calendar (`calendarlist${calendar.id}`)}
			<Card.Root class="hover:shadow-lg transition-shadow">
				<Card.Header>
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-1">
							<Avatar.Root class="h-15 w-15">
								<Avatar.Image
									src="{data.pb_url}/api/files/{calendar.collectionId}/{calendar.id}/{calendar.logo}"
									alt="Avatar"
								/>
								<Avatar.Fallback><NoCalendarAvatar /></Avatar.Fallback>
							</Avatar.Root>
							<div>
								<Card.Title class="text-lg flex">
									{calendar.name}
									{#if calendar.passwordEnabled}
										<div class="flex items-center gap-1 ml-1 text-xs text-muted-foreground">
											<span>•</span>
											<Tooltip.Provider>
												<Tooltip.Root>
													<Tooltip.Trigger>
														<Shield class="h-4 w-4" />
													</Tooltip.Trigger>
													<Tooltip.Content>Password Protected</Tooltip.Content>
												</Tooltip.Root>
											</Tooltip.Provider>
										</div>
									{/if}
								</Card.Title>
								<Card.Description class="text-sm mt-1">/cal/{calendar.publicId}</Card.Description>
							</div>
						</div>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger class={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8")}>
								<MoreVertical class="h-4 w-4" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item onclick={() => copyCalLinkToClipboard(calendar.id)}>
									<Copy class="h-4 w-4 mr-2 data-highlighted:text-primary" />
									Copy Link
								</DropdownMenu.Item>

								<DropdownMenu.Item
									class="text-destructive"
									onclick={() => {
										deleteCalendarId = calendar.id;
									}}
								>
									<Trash2 class="h-4 w-4 mr-2 data-highlighted:text-primary" />
									Delete
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</Card.Header>

				<Card.Content>
					<p class="text-sm text-muted-foreground mb-4">{calendar.description}</p>

					<div class="flex items-center justify-between pt-4 border-t border-border">
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<Users class="h-4 w-4" />
							<span>{calendar.visits} Visit{calendar.visits === 1 ? "" : "s"}</span>
						</div>

						<Button variant="outline" size="sm" href="/dashboard/calendars/{calendar.id}">
							View Details
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div> -->

<!-- Delete Calendar Dialog -->
<Dialog.Root open={deleteCalendarId !== null} onOpenChange={() => (deleteCalendarId = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				<Mono class="text-xs text-muted-foreground">
					This action cannot be undone. This will permanently delete this calendar from our servers.
					All links or image feeds relying on this calendar will not work.
				</Mono>
			</Dialog.Description>
			<Dialog.Footer>
				<Button variant="destructive" onclick={deleteCal}>Confirm Delete</Button>
			</Dialog.Footer>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

<div
	class="flex-1 flex flex-col min-w-0 overflow-hidden relative"
	style="height: calc(100vh - 49px);
		height: calc(100dvh - 49px);"
>
	<div class="flex items-center gap-4 px-6 py-2.5 border-b border-border bg-background shrink-0">
		<div class="flex items-center gap-2">
			<CalendarDays size={14} class="text-muted-foreground" />
			<FieldLabel>CALENDARS</FieldLabel>
		</div>
		<div class="flex-1"></div>
		<div
			class="flex items-center gap-1.5 border border-border px-3 py-1.5 w-48 focus-within:border-primary transition-colors"
		>
			<Search size={11} class="text-muted-foreground shrink-0" />
			<input
				bind:value={calendarSearch}
				placeholder="Search calendars..."
				class="bg-transparent font-mono text-xs outline-none flex-1 text-foreground placeholder:text-muted-foreground"
				style="font-family: 'JetBrains Mono', monospace"
			/>
		</div>
		<button
			onclick={createNewCalendar}
			class="font-mono text-[10px] tracking-widest bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
		>
			<Plus size={11} /> NEW CALENDAR
		</button>
	</div>

	<div
		class="px-6 py-3 border-b border-border bg-card/30 flex items-center justify-between shrink-0"
	>
		<div>
			<p class="text-xs text-muted-foreground" style="font-family: Inter, sans-serif">
				Full-featured embeddable calendars with custom views, filters, and sharing. Events are
				automatically synced from Planning Center.
			</p>
		</div>
		<div class="flex items-center gap-4">
			<Mono class="text-[10px] text-muted-foreground"
				>{(await getMyCalendars()).length}
				{(await getMyCalendars()).length === 1 ? "item" : "items"}</Mono
			>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto p-6 h-full">
		{#if filtered.length === 0 && calendarSearch === ""}
			<div
				class="flex flex-col items-center justify-center h-64 gap-4 border border-dashed border-border"
			>
				<CalendarDays size={32} class="text-border" />
				<div class="text-center">
					<div
						class="text-sm font-medium text-muted-foreground"
						style="font-family: Inter, sans-serif"
					>
						No calendars yet
					</div>
					<Mono class="text-[10px] text-muted-foreground mt-1"
						>Click + NEW CALENDAR to create one</Mono
					>
				</div>
				<button
					onclick={createNewCalendar}
					class="font-mono text-[10px] tracking-widest border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
				>
					+ CREATE YOUR FIRST
				</button>
			</div>
		{:else if filtered.length === 0}
			<div class="flex items-center justify-center h-32">
				<Mono class="text-xs text-muted-foreground">No results for "{calendarSearch}"</Mono>
			</div>
		{:else}
			<AnimatePresence>
				<div class="space-y-3">
					{#each filtered as item (item.id)}
						<CalItemCard
							pb_url={data.pb_url}
							{item}
							key={item.id}
							onDelete={(item) => {
								deleteCalendarId = item.id;
							}}
							onEdit={() => {
								selectedCalendarID = item.id;
								panelOpen = true;
							}}
						/>
					{/each}
				</div>
			</AnimatePresence>
		{/if}
	</div>

	<CalendarPanel bind:open={panelOpen} calendarID={selectedCalendarID} pb_url={data.pb_url} />
</div>

<Dialog.Root bind:open={newCalendarDialogOpen}>
	<Dialog.Content class="sm:max-w-125">
		<Dialog.Header>
			<Dialog.Title>Create New Calendar</Dialog.Title>
			<Dialog.Description
				>You can change more settings after creating the calendar.</Dialog.Description
			>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="name">Calendar URL path</Label>
				<Input id="publicId" placeholder="e.g., publishedevents" bind:value={newCalendarPublicId} />
			</div>

			<div class="space-y-2">
				<Label for="name">Calendar Name</Label>
				<Input id="name" placeholder="e.g., Published Events" bind:value={newCalendarName} />
			</div>

			<div class="space-y-2">
				<Label for="description">Description</Label>
				<Textarea
					id="description"
					placeholder="Brief description of this calendar type"
					bind:value={newCalendarDescription}
					rows={3}
				/>
			</div>
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="password-protection" class="text-base">Password Protection</Label>
					<p class="text-sm text-muted-foreground">Require a password to access this calendar</p>
				</div>
				<Switch id="password-protection" bind:checked={newCalendarPasswordEnabled} />
			</div>

			{#if newCalendarPasswordEnabled}
				<div class="space-y-2 pt-2">
					<Label for="password">Calendar Password</Label>
					<Input
						id="password"
						bind:value={newCalendarPassword}
						type="password"
						placeholder="Enter password"
					/>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (newCalendarDialogOpen = false)}>Cancel</Button>
			<Button onclick={handleCreateCalendar}>
				{#if creatingCalendar}
					<Spinner />
					Creating Calendar...
				{:else}
					Create Calendar
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
