<script lang="ts">
    import { addIFeedIncludedCalendar, removeIFeedIncludedCalendar } from "./endpointCalls/updateIfeedIncludedCalendars";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import AnIncludedCalendar from "./AnIncludedCalendar.svelte";
    import * as Empty from "$lib/components/ui/empty/index.js";
    import { Button } from "@/components/ui/button";
    import { invalidateAll } from "$app/navigation";
    import { type CalendarDBModel } from "@/utils";
    import { CalendarDays } from "@lucide/svelte";
    import { toast } from "svelte-sonner";

    let { 
        includedCalendars,
        pb_url,
        calendars,
        iFeedId
    }: {
        iFeedId: string,
        includedCalendars: string[],
        pb_url: string
        calendars: CalendarDBModel[]
    } = $props();

    let includeACalendarPopup = $state(false);
    let calsToAdd: string[] = $state([]);

    async function includeCalendar() {
        if (calsToAdd.length === 0) {
            toast.error("You didnt select any calendar.");
            return
        }

        const success = await addIFeedIncludedCalendar(iFeedId, calsToAdd);
        includeACalendarPopup = false;

        if (success) invalidateAll();
    }

    async function removeCal(calId: string) {
        const success = await removeIFeedIncludedCalendar(iFeedId, calId);

        if (success) invalidateAll();
    }

    $effect(() => {
        if (!includeACalendarPopup) {
            calsToAdd = [];
        }
    });

    function addToCalsToAdd(event: Event, calId: string) {
        //@ts-ignore
        if (event.target?.checked) {
            calsToAdd.push(calId);
        } else {
            calsToAdd = calsToAdd.filter((cal) => cal !==calId);
        }
    }
</script>


<div class="space-y-3">
    {#if includedCalendars.length > 0}
        {#each includedCalendars as calendar (`includedcals${calendar}`)}
            <AnIncludedCalendar {calendars} calendarId={calendar} pb_url={pb_url} removeAdditionalCalendar={removeCal} />
        {/each}
        <div class="w-full flex items-center justify-center mt-2">
            <Button variant="outline" class="w-full" onclick={() => includeACalendarPopup = true}>Include Calendar</Button>
        </div>
    {:else}
        <Empty.Root>
            <Empty.Header>
                <Empty.Media variant="icon">
                <CalendarDays />
                </Empty.Media>
                <Empty.Title>No Included Calendars</Empty.Title>
                <Empty.Description>
                    You haven't included a calendar yet. If you haven't created any calendars, create one and then include it here.
                </Empty.Description>
            </Empty.Header>
            <Empty.Content>
                <div class="flex gap-2">
                    <Button onclick={() => includeACalendarPopup = true}>Include Calendar</Button>
                    <Button href="/dashboard/calendars?new=1" variant="outline">Create A Calendar</Button>
                </div>
            </Empty.Content>
        </Empty.Root>
    {/if}
</div>

<Dialog.Root bind:open={includeACalendarPopup}>
    <Dialog.Content class="sm:max-w-[500px] max-h-screen overflow-y-auto" style="max-height: calc(100vh - 50px);">
        <Dialog.Header>
            <Dialog.Title>Incude Calendar</Dialog.Title>
            <Dialog.Description>KEEP IN MIND that a password protected calendar will be public and will not require a password. Also, any calendar that has access to UNPUBLISHED events also will be public.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            {#each calendars as calendar (`acalendartoadd${calendar.id}`)}
                {#if !includedCalendars.includes(calendar.id)}
                    <div>
                        <input
                            type="checkbox"
                            name="caltoadd{calendar.id}"
                            id="caltoadd{calendar.id}"
                            onchange={(event) => addToCalsToAdd(event, calendar.id)}
                        />
                        <label for="caltoadd{calendar.id}">
                            {calendar.name}
                        </label>
                    </div>
                {/if}
            {/each}
        </div>
        <Dialog.Footer>
            <Button onclick={includeCalendar}>Add</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>