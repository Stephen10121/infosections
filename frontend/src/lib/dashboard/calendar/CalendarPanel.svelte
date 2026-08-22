<script lang="ts">
	import type { CalendarDBModel } from "@/cal.utils";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import FormInput from "@/components/FormInput.svelte";
	import FormTextarea from "@/components/FormTextarea.svelte";
	import Mono from "@/components/Mono.svelte";
	import SettingRow from "@/components/SettingRow.svelte";
	import TagSelect from "@/components/TagSelect.svelte";
	import Toggle from "@/components/Toggle.svelte";
	import ViewModeRadio from "@/components/ViewModeRadio.svelte";
	import { cn } from "@/utils";
	import { AnimatePresence, motion } from "@humanspeak/svelte-motion";
	import { Unlock, X, Lock } from "@lucide/svelte";
	import {
		getMyEventResourcesPrivate,
		getMyEventTagsPrivate
	} from "../../../routes/(mainWebsite)/dashboard/events.remote";
	import type { EventResourcesDBModelPrivate, EventTagsDBModelPrivate } from "@/event.utils";
	import ResourceSelect from "@/components/ResourceSelect.svelte";
	import CopyButton from "@/CopyButton.svelte";

	type Tabs = "basic" | "display" | "filters" | "security" | "share";

	let { calendar, open = $bindable() }: { calendar: CalendarDBModel; open: boolean } = $props();

	const tabs: Tabs[] = ["basic", "display", "filters", "security", "share"];

	let tab: Tabs = $state("basic");

	let myTags = $derived(await getMyEventTagsPrivate());
	let selectedTags: EventTagsDBModelPrivate[] = $state([]);

	let myResources = $derived(await getMyEventResourcesPrivate());
	let selectedResources: EventResourcesDBModelPrivate[] = $state([]);

	let shareLink = $derived(`https://infosections.com/cal/${calendar.publicId}`);

	function close() {
		open = false;
	}
</script>

<AnimatePresence>
	{#if open}
		<motion.div
			key="backdrop"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			class="fixed inset-0 top-12 z-30 bg-foreground/10 backdrop-blur-[2px]"
			onclick={close}
		/>
		<motion.div
			key="panel"
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
			class="fixed top-12 right-0 bottom-0 w-120 max-w-full bg-background border-l border-border z-40 flex flex-col"
			style="box-shadow: -24px 0 48px rgba(0,0,0,0.08)"
		>
			<div
				class="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 shrink-0"
			>
				<div class="flex items-center gap-2.5">
					<Mono class="text-[9px] px-1.5 py-0.5 font-semibold bg-primary/15 text-primary">
						CALENDAR
					</Mono>
					<span
						class="text-sm font-semibold text-foreground"
						style="font-family: Inter, sans-serif"
					>
						{calendar.name}
					</span>
				</div>
				<button
					onclick={close}
					class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
				>
					<X size={16} />
				</button>
			</div>

			<!-- <div class="flex border-b border-border shrink-0">
            <StatChip label="VIEWS" value={item!.stats.views.toLocaleString()} icon={Eye} />
            <StatChip label="EVENTS" value={item!.stats.events} icon={Calendar} />
            <StatChip label="EMBEDS" value={item!.stats.embeds} icon={Code} />
        </div> -->

			<div class="flex border-b border-border shrink-0 overflow-x-auto">
				{#each tabs as t (t)}
					<button
						onclick={() => (tab = t)}
						class={cn(
							"px-4 py-2.5 font-mono text-[10px] tracking-widest transition-colors whitespace-nowrap cursor-pointer border-b-2",
							tab === t
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground"
						)}
					>
						{t}
					</button>
				{/each}
			</div>

			<div class="flex-1 overflow-y-auto">
				{#if tab === "basic"}
					<div class="p-5 space-y-5">
						<div>
							<FieldLabel>Name</FieldLabel>
							<div class="mt-2">
								<FormInput value={calendar.name} type="text" placeholder="e.g. Sunday Services" />
							</div>
						</div>
						<div>
							<FieldLabel>Description</FieldLabel>
							<div class="mt-2">
								<FormTextarea
									value={calendar.description}
									placeholder="What events does this show?"
									rows={4}
								/>
							</div>
						</div>
						{#if calendar.name}
							<div class="p-3 bg-muted/40 border border-border/40">
								<FieldLabel>Preview URL</FieldLabel>
								<Mono class="text-[10px] text-primary mt-1 block break-all">{shareLink}</Mono>
							</div>
						{/if}
					</div>
				{:else if tab === "display"}
					<div class="p-5 space-y-6">
						<div>
							<FieldLabel>Default View</FieldLabel>
							<div class="mt-3">
								<ViewModeRadio bind:value={calendar.displaySettings.viewType} />
							</div>
							<Mono class="text-[10px] text-muted-foreground mt-2 block">
								Controls how events are laid out by default. Users can switch views.
							</Mono>
						</div>

						<div>
							<FieldLabel>Display Options</FieldLabel>
							<div class="mt-2">
								<SettingRow
									label="Show event descriptions"
									sub="Display full description below event title"
								>
									<Toggle bind:on={calendar.displaySettings.showDescription} />
								</SettingRow>
								<SettingRow
									label="12-hour (AM/PM) format"
									sub="Use 12-hour clock instead of 24-hour"
								>
									<Toggle bind:on={calendar.displaySettings.useAMPM} />
								</SettingRow>
								<SettingRow label="Show resources" sub="Display assigned resources on each event">
									<Toggle bind:on={calendar.displaySettings.showResources} />
								</SettingRow>
								<SettingRow label="Show rooms" sub="Display room assignments when available">
									<Toggle bind:on={calendar.displaySettings.showRooms} />
								</SettingRow>
								<SettingRow label="Show location" sub="Display event location / venue name">
									<Toggle bind:on={calendar.displaySettings.showLocation} />
								</SettingRow>
							</div>
						</div>
					</div>
				{:else if tab === "filters"}
					<div class="p-5 space-y-6">
						<div>
							<FieldLabel>Visibility</FieldLabel>
							<div class="mt-2">
								<SettingRow
									label="Featured events only"
									sub="Only show events marked as featured in Planning Center"
								>
									<Toggle bind:on={calendar.filters.onlyShowFeatured} />
								</SettingRow>
								<SettingRow label="Hide unpublished events" sub="Suppress draft and private events">
									<Toggle on={calendar.filters.hideUnpublished} />
								</SettingRow>
							</div>
						</div>

						<div>
							<FieldLabel>Tag Filter</FieldLabel>
							<Mono class="text-[10px] text-muted-foreground mt-1 mb-3 block">
								Only events matching at least one of these tags will appear.
							</Mono>
							<TagSelect
								selected={selectedTags}
								options={myTags}
								onAdd={(t) => (selectedTags = [...selectedTags, t])}
								onRemove={(t) => (selectedTags = selectedTags.filter((tag) => tag !== t))}
								placeholder="Add tag filter..."
							/>
							{#if selectedTags.length === 0}
								<Mono class="text-[10px] text-muted-foreground mt-2 block"
									>No tag filter — all tags shown.</Mono
								>
							{/if}
						</div>

						<div>
							<FieldLabel>Resource Filter</FieldLabel>
							<Mono class="text-[10px] text-muted-foreground mt-1 mb-3 block">
								Restrict to events assigned to specific resources or rooms.
							</Mono>
							<ResourceSelect
								selected={selectedResources}
								options={myResources}
								onAdd={(t) => (selectedResources = [...selectedResources, t])}
								onRemove={(t) =>
									(selectedResources = selectedResources.filter((resource) => resource !== t))}
								placeholder="Add resource..."
							/>
							{#if selectedResources.length === 0}
								<Mono class="text-[10px] text-muted-foreground mt-2 block"
									>No resource filter — all resources shown.</Mono
								>
							{/if}
						</div>
					</div>
				{:else if tab === "security"}
					<div class="p-5 space-y-6">
						<div>
							<FieldLabel>Access Control</FieldLabel>
							<div class="mt-2">
								<SettingRow
									label="Password protection"
									sub="Require a password to view this calendar"
								>
									<Toggle bind:on={calendar.passwordEnabled} />
								</SettingRow>
							</div>
						</div>

						{#if calendar.passwordEnabled}
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								class="space-y-3"
							>
								<FieldLabel>Password</FieldLabel>
								<div class="flex gap-2 items-center">
									<div class="flex-1">
										<FormInput
											type="password"
											bind:value={calendar.password}
											placeholder="Set a password..."
										/>
									</div>
									<div class="text-primary">
										<Lock size={16} />
									</div>
								</div>
								<Mono class="text-[10px] text-muted-foreground block">
									Visitors will be prompted to enter this password before viewing.
								</Mono>
							</motion.div>
						{:else}
							<div class="flex items-center gap-3 p-3 bg-muted/30 border border-border/40">
								<Unlock size={14} class="text-muted-foreground shrink-0" />
								<Mono class="text-[10px] text-muted-foreground"
									>This calendar is publicly accessible — no password required.</Mono
								>
							</div>
						{/if}
					</div>
				{:else if tab === "share"}
					<div class="p-5 space-y-5">
						<!-- <div>
                    <FieldLabel>Statistics</FieldLabel>
                    <div class="flex mt-3 gap-0">
                    <StatChip label="TOTAL VIEWS" value={item!.stats.views.toLocaleString()} icon={Eye} />
                    <StatChip label="EVENTS" value={item!.stats.events} icon={Calendar} />
                    <StatChip label="EMBEDS" value={item!.stats.embeds} icon={Code} />
                    </div>
                </div> -->

						<div>
							<FieldLabel>Share URL</FieldLabel>
							<div class="flex gap-2 mt-2">
								<div class="flex-1 border border-border px-3 py-2 bg-muted/20 overflow-hidden">
									<Mono class="text-[10px] text-foreground break-all">{shareLink}</Mono>
								</div>
								<CopyButton text={shareLink} />
							</div>
						</div>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-2 px-5 py-3.5 border-t border-border shrink-0 bg-card/40">
				<button
					type="button"
					class="font-mono text-[10px] tracking-widest px-5 py-2.5 transition-colors cursor-pointer bg-primary text-primary-foreground hover:opacity-90"
				>
					SAVE CHANGES
				</button>
				<button
					type="button"
					onclick={close}
					class="font-mono text-[10px] tracking-widest px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
				>
					CANCEL
				</button>
				<div class="flex-1"></div>
				<Mono class="text-[9px] text-muted-foreground">created {calendar.created}</Mono>
			</div>
		</motion.div>
	{/if}
</AnimatePresence>
