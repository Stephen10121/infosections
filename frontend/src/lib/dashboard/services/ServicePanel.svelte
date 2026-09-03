<script lang="ts">
	import { AnimatePresence, motion } from "@humanspeak/svelte-motion";
	import {
		getMyServices,
		getMyServiceTypes
	} from "../../../routes/(mainWebsite)/dashboard/services.remote";
	import Mono from "@/components/Mono.svelte";
	import { Eye, Printer, Share2, X } from "@lucide/svelte";
	import { cn } from "@/utils";
	import FieldLabel from "@/components/FieldLabel.svelte";
	import FormInput from "@/components/FormInput.svelte";
	import FormTextarea from "@/components/FormTextarea.svelte";
	import SettingRow from "@/components/SettingRow.svelte";
	import Toggle from "@/components/Toggle.svelte";
	import StatChip from "../StatChip.svelte";
	import CopyButton from "@/CopyButton.svelte";

	let {
		open = $bindable(),
		serviceID = $bindable()
	}: {
		open: boolean;
		serviceID: string | undefined;
	} = $props();

	let service = $derived((await getMyServices()).filter((service) => service.id === serviceID)[0]);

	type ServicePanelTab = "basic" | "plan" | "customize" | "share";

	let tab = $state<ServicePanelTab>("basic");
	let computedShare = $derived(
		service?.public_id ? `https://infosections.com/service/${service.public_id}` : ""
	);

	function close() {}

	const tabs: ServicePanelTab[] = ["basic", "plan", "customize", "share"];
</script>

<AnimatePresence>
	{#if open && service}
		<motion.div
			key="service-backdrop"
			class="absolute inset-0 top-0 left-0 w-full h-full z-30 bg-foreground/10 backdrop-blur-[2px]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={close}
		/>
		<motion.div
			key="service-panel"
			class="fixed top-12 right-0 bottom-0 w-120 max-w-full bg-background border-l border-border z-40 flex flex-col"
			style="box-shadow: -24px 0 48px rgba(0,0,0,0.08)"
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ type: "spring", damping: 30, stiffness: 300 }}
		>
			<div class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
				<div>
					<Mono class="text-[10px] text-primary font-semibold block">SVC · EDIT</Mono>
					<Mono class="text-xs text-foreground">{service.name}</Mono>
				</div>
				<button
					onclick={close}
					class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
					><X size={16} /></button
				>
			</div>

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
						{t.toUpperCase()}
					</button>
				{/each}
			</div>

			<div class="flex-1 overflow-y-auto">
				<div class="p-5 space-y-5 {tab === 'basic' ? 'block' : 'hidden'}">
					<div>
						<FieldLabel>Avatar / Logo</FieldLabel>
						<div class="mt-2">
							<!-- <ImageUpload value={form.avatar ?? ""} onChange={v => set("avatar", v)} hint="Shown on the public service overview page" /> -->
						</div>
					</div>
					<div>
						<FieldLabel>Service Name</FieldLabel>
						<div class="mt-2">
							<FormInput value="" type="text" placeholder="e.g. Sunday Morning" />
						</div>
					</div>
					<div>
						<FieldLabel>Description</FieldLabel>
						<div class="mt-2">
							<FormTextarea value="" placeholder="Brief description of this service" />
						</div>
					</div>
					<div>
						<FieldLabel>Planning Center Service Type</FieldLabel>
						<Mono class="text-[9px] text-muted-foreground mt-1 mb-2 block"
							>Link to a Planning Center service type to pull live plan data.</Mono
						>
						<div class="space-y-1.5">
							{#each await getMyServiceTypes() as st (st.id)}
								<button
									type="button"
									class={cn(
										"w-full flex items-center gap-3 px-3 py-2.5 border text-left transition-colors cursor-pointer",
										"border-border hover:border-primary/50"
									)}
								>
									<div
										class={cn(
											"w-4 h-4 shrink-0 border flex items-center justify-center",
											"border-muted-foreground"
										)}
									>
										<!-- {selected && <Check size={10} class="text-primary-foreground" />} -->
									</div>
									<Mono class="text-[11px] text-foreground">{st.name}</Mono>
									<Mono class="text-[9px] text-muted-foreground ml-auto">{st.sequence}</Mono>
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- <div class="p-5 space-y-5 {tab === 'plan' ? 'block' : 'hidden'}">
                  {form.pcServiceTypeId ? (
                    <>
                      <div class="flex items-center justify-between">
                        <FieldLabel>LIVE PLAN DATA</FieldLabel>
                        <div class="flex items-center gap-1.5 text-primary">
                          <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <Mono class="text-[9px]">Connected</Mono>
                        </div>
                      </div>

                      {/* Plan header */}
                      <div class="border border-border p-4 space-y-3">
                        <div class="flex items-start justify-between gap-3">
                          <div>
                            <Mono class="text-[9px] text-muted-foreground block">{mockPCPlan.seriesTitle}</Mono>
                            <Mono class="text-[12px] font-semibold text-foreground block mt-0.5">{mockPCPlan.planTitle}</Mono>
                          </div>
                          <Mono class="text-[9px] text-muted-foreground flex-shrink-0">{mockPCPlan.date}</Mono>
                        </div>
                        <div class="flex gap-2 flex-wrap">
                          {mockPCPlan.times.map(t => (
                            <span key={t} class="px-2 py-0.5 bg-muted font-mono text-[10px] text-foreground">{t}</span>
                          ))}
                        </div>
                      </div>

                      {/* Songs */}
                      <div>
                        <FieldLabel>SONGS · {mockPCPlan.songs.length}</FieldLabel>
                        <div class="mt-2 space-y-1.5">
                          {mockPCPlan.songs.map((song, i) => (
                            <div key={i} class="flex items-center gap-3 px-3 py-2.5 border border-border">
                              <Music size={11} class="text-muted-foreground flex-shrink-0" />
                              <div class="flex-1 min-w-0">
                                <Mono class="text-[11px] text-foreground block truncate">{song.title}</Mono>
                                <Mono class="text-[9px] text-muted-foreground block">{song.author}</Mono>
                              </div>
                              <span class="px-1.5 py-0.5 bg-muted font-mono text-[9px] text-foreground">{song.key}</span>
                              <Mono class="text-[9px] text-muted-foreground">{song.duration}</Mono>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Team */}
                      <div>
                        <FieldLabel>TEAM · {mockPCPlan.team.length}</FieldLabel>
                        <div class="mt-2 grid grid-cols-2 gap-1.5">
                          {mockPCPlan.team.map((member, i) => (
                            <div key={i} class="flex items-center gap-2 px-3 py-2 border border-border">
                              <div class="w-6 h-6 bg-muted flex items-center justify-center flex-shrink-0">
                                <Mono class="text-[8px] text-muted-foreground">{member.name.slice(0, 2).toUpperCase()}</Mono>
                              </div>
                              <div class="min-w-0">
                                <Mono class="text-[10px] text-foreground block truncate">{member.name}</Mono>
                                <Mono class="text-[9px] text-muted-foreground block truncate">{member.role}</Mono>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <FieldLabel>NOTES</FieldLabel>
                        <div class="mt-2 border border-border px-3 py-3 bg-muted/20">
                          <Mono class="text-[10px] text-foreground leading-relaxed block">{mockPCPlan.notes}</Mono>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
                      <BookOpen size={24} class="text-border" />
                      <div>
                        <Mono class="text-[11px] text-foreground block">No service type linked</Mono>
                        <Mono class="text-[9px] text-muted-foreground block mt-1">Go to the Basic tab and connect a Planning Center service type to see live plan data.</Mono>
                      </div>
                    </div>
                  )}
                </div> -->

				<div class="p-5 space-y-5 {tab === 'customize' ? 'block' : 'hidden'}">
					<div>
						<FieldLabel>Custom Intro</FieldLabel>
						<div class="mt-2">
							<FormTextarea
								value=""
								placeholder="Optional intro text shown at the top of the service overview."
							/>
						</div>
					</div>

					<div>
						<FieldLabel>Theme</FieldLabel>
						<div class="mt-2 grid grid-cols-3 gap-2">
							{#each ["minimal", "bulletin", "full"] as t (t)}
								<button
									type="button"
									class={cn(
										"py-2.5 border font-mono text-[10px] transition-colors cursor-pointer",
										"border-border text-muted-foreground hover:border-primary/50"
									)}
									style="font-family: 'JetBrains Mono', monospace"
								>
									{t.toUpperCase()}
								</button>
							{/each}
						</div>
						<Mono class="text-[9px] text-muted-foreground mt-1.5 block">
							{service.display_settings.theme === "minimal" && "Title, date, and times only."}
							{service.display_settings.theme === "bulletin" &&
								"Church bulletin style with all sections."}
							{service.display_settings.theme === "full" &&
								"Full detail view with all Planning Center data."}
						</Mono>
					</div>

					<div>
						<FieldLabel>Visible Sections</FieldLabel>
						<div class="mt-2 space-y-0">
							{#each [{ key: "showSeriesInfo" as const, label: "Series information", sub: "Series title and plan title" }, { key: "showTimes" as const, label: "Service times", sub: "All scheduled service times" }, { key: "showSongs" as const, label: "Song list", sub: "Songs, authors, and keys" }, { key: "showTeam" as const, label: "Team roster", sub: "Assigned team members and roles" }, { key: "showNotes" as const, label: "Notes", sub: "Plan notes and announcements" }] as aSetting (aSetting.key)}
								<SettingRow label={aSetting.label} sub={aSetting.sub}>
									<Toggle on={false} />
								</SettingRow>
							{/each}
						</div>
					</div>
				</div>

				<div class="p-5 space-y-5 {tab === 'share' ? 'block' : 'hidden'}">
					<div>
						<FieldLabel>Statistics</FieldLabel>
						<div class="flex mt-3 gap-0">
							<StatChip label="VIEWS" value={service.views} icon={Eye} />
							<StatChip label="PRINTS" value={service.prints} icon={Printer} />
							<StatChip label="SHARES" value={service.shares} icon={Share2} />
						</div>
					</div>

					<div>
						<FieldLabel>Share URL</FieldLabel>
						<div class="flex gap-2 mt-2">
							<div class="flex-1 border border-border px-3 py-2 bg-muted/20 overflow-hidden">
								<Mono class="text-[10px] text-foreground break-all"
									>{computedShare || "— save first to generate"}</Mono
								>
							</div>
							{#if computedShare}
								<CopyButton text={computedShare} />
							{/if}
						</div>
					</div>

					<div class="border border-border p-4 space-y-3">
						<FieldLabel>Print Service Overview</FieldLabel>
						<Mono class="text-[10px] text-muted-foreground block"
							>Opens a print-ready view of this service plan, formatted for your chosen theme.</Mono
						>
						<button
							class="w-full py-2.5 border border-border text-muted-foreground font-mono text-[10px] hover:border-primary hover:text-primary transition-colors cursor-pointer flex items-center justify-center gap-2"
							style="font-family: 'JetBrains Mono', monospace"
						>
							<Printer size={12} /> OPEN PRINT VIEW
						</button>
					</div>
				</div>
			</div>

			<div class="px-5 py-3.5 border-t border-border flex gap-2 shrink-0">
				<button
					onclick={close}
					class="flex-1 py-2 border border-border text-muted-foreground font-mono text-[10px] tracking-widest hover:border-foreground/25 hover:text-foreground transition-colors cursor-pointer"
					style="font-family: 'JetBrains Mono', monospace"
				>
					CANCEL
				</button>
				<button
					disabled={false}
					class="flex-1 py-2 bg-primary text-primary-foreground font-mono text-[10px] tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
					style="font-family: 'JetBrains Mono', monospace"
				>
					SAVE SERVICE
				</button>
			</div>
		</motion.div>
	{/if}
</AnimatePresence>
