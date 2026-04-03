<script lang="ts">
    import type { CalendarDBModel, EventListDBModel, ImageFeedDBModel } from "./utils";
    import Badge from "./components/ui/badge/badge.svelte";
    import * as Kbd from "$lib/components/ui/kbd/index.js";
    import { Input } from "@/components/ui/input";
    import {  Search, } from "@lucide/svelte";
    import { goto } from "$app/navigation";

    let { 
        calendars,
        imageFeeds,
        eventLists
    }: {
        calendars: CalendarDBModel[],
        imageFeeds: ImageFeedDBModel[],
        eventLists: EventListDBModel[],
    } = $props();

    let everythingInput: HTMLInputElement | null = $state(null);
    let everythingInputFocused = $state(false);

    type FilteredTermsList = ({type: "calendar", data: CalendarDBModel } | { type: "image-feed", data: ImageFeedDBModel } | {type: "event-list", data: EventListDBModel })

    let filteredTerms: FilteredTermsList[] = $state([]);
    let arrowDownIndex = $state(-1);

    function searchInputChanged(event: Event) {
        //@ts-ignore
        const searchTerm = event.target.value.toLowerCase();
        if (!searchTerm) {
            filteredTerms = [];
            return
        }

        let newFilteredTerms: FilteredTermsList[] = [];

        for (let i=0;i<calendars.length;i++) {
            if (calendars[i].id.toLowerCase().includes(searchTerm) ||
            calendars[i].name.toLowerCase().includes(searchTerm) ||
            calendars[i].description.toLowerCase().includes(searchTerm) ||
            "calendar".includes(searchTerm)) {
                newFilteredTerms.push({ type: "calendar", data: calendars[i] });
            }
        }

        for (let i=0;i<imageFeeds.length;i++) {
            if (imageFeeds[i].id.toLowerCase().includes(searchTerm) ||
            imageFeeds[i].name.toLowerCase().includes(searchTerm) ||
            imageFeeds[i].description.toLowerCase().includes(searchTerm) ||
            "image feed".includes(searchTerm)) {
                newFilteredTerms.push({ type: "image-feed", data: imageFeeds[i] });
            }
        }

        for (let i=0;i<eventLists.length;i++) {
            if (eventLists[i].id.toLowerCase().includes(searchTerm) ||
            eventLists[i].name.toLowerCase().includes(searchTerm) ||
            eventLists[i].description.toLowerCase().includes(searchTerm) ||
            "event list".includes(searchTerm)) {
                newFilteredTerms.push({ type: "event-list", data: eventLists[i] });
            }
        }

        filteredTerms = newFilteredTerms;
        arrowDownIndex = -1;
    }

    function resetSearch() {
        if (everythingInput) {
            everythingInput.value = "";
            filteredTerms = [];
            arrowDownIndex = -1;
        }
    }

    function keyDown(event: KeyboardEvent) {
        if (event.key === "/" && event.ctrlKey && everythingInput && !everythingInputFocused) {
            event.preventDefault();
            arrowDownIndex = -1;
            everythingInput.focus();
        }

        if (everythingInputFocused && filteredTerms.length > 0) {
            if (event.key === "ArrowUp") {
                if (arrowDownIndex === -1 || arrowDownIndex === 1) {
                    arrowDownIndex = filteredTerms.length;
                } else {
                    arrowDownIndex -= 1;
                }
            } else if (event.key === "ArrowDown") {
                if (arrowDownIndex === filteredTerms.length || arrowDownIndex === -1) {
                    arrowDownIndex = 1;
                } else {
                    arrowDownIndex += 1;
                }
            }
        }

        if (event.key === "Enter" && arrowDownIndex !== -1) {
            goto(`/dashboard/${filteredTerms[arrowDownIndex - 1].type === "calendar" ? "calendars" : filteredTerms[arrowDownIndex - 1].type === "event-list" ? "event-lists" : "image-feeds"}/${filteredTerms[arrowDownIndex - 1].data.id}`);
            resetSearch();
        }
    }
</script>

<svelte:window onkeydown={keyDown} />

<div class="relative w-full max-w-md">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Kbd.Group>
            <Kbd.Root>⌘</Kbd.Root>
            <span>+</span>
            <Kbd.Root>/</Kbd.Root>
        </Kbd.Group>
    </div>
    <Input
        bind:ref={everythingInput}
        onfocusin={() => everythingInputFocused=true}
        onfocusout={() => setTimeout(() => everythingInputFocused=false, 200)}
        oninput={searchInputChanged}
        placeholder="Search calendars, image feeds..."
        class="pl-9 pr-9 bg-background"
    />

    {#if everythingInputFocused && filteredTerms.length > 0}
        <div class="border shadow-lg bg-card absolute left-0 -bottom-1 translate-y-full w-full max-w-md rounded-lg p-1 z-50 isolate everythingSearcher">
            {#each filteredTerms as term, index (`filteredSearchTerms${term.data.id}`)}
                <a
                    onclick={resetSearch}
                    href="/dashboard/{term.type === "calendar" ? "calendars" : term.type === "event-list" ? "event-lists" : "image-feeds"}/{term.data.id}"
                    class="w-full px-4 py-3 hover:bg-accent/50 transition-colors text-left flex flex-col gap-1 rounded-md {arrowDownIndex - 1 === index ? "bg-accent/70" : ""}"
                >
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-foreground underline">{term.data.name}</span>
                        {#if term.type === "calendar"}
                            <Badge variant="outline">Calendar</Badge>
                        {:else if term.type === "event-list"}
                            <Badge variant="outline">Event List</Badge>
                        {:else}
                            <Badge variant="outline">Image Feed</Badge>
                        {/if}
                    </div>
                    <p class="text-sm text-muted-foreground line-clamp-1">{term.data.description}</p>
                </a>
            {/each}
        </div>
    {/if}
</div>

<style>
    @media (max-width: 500px) {
        .everythingSearcher {
            min-width: calc(100vw - 20px) !important;
            left: -58px;
        }
    }
</style>