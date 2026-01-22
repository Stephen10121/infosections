<script lang="ts">
    import { Shield, CalendarDays, TriangleAlert, X } from "@lucide/svelte";
    import { type CalendarDBModel } from "@/utils";
    import { Button } from "@/components/ui/button";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    let { 
        calendarId,
        calendars,
        pb_url,
        removeAdditionalCalendar
    }: {
        pb_url: string,
        calendarId: string,
        calendars: CalendarDBModel[],
        removeAdditionalCalendar: (id: string) => unknown
    } = $props();

    let actualCalendar = $derived(calendars.find((cal) => cal.id === calendarId))
</script>

{#if actualCalendar}
    <div class="flex items-center gap-4 rounded-lg border border-border p-4">
        {#if actualCalendar.logo}
            <div class="relative group">
                <img
                    src="{pb_url}/api/files/{actualCalendar.collectionId}/{actualCalendar.id}/{actualCalendar.logo}"
                    alt="IFeed Avatar"
                    class="w-10 h-10 rounded-lg object-cover border-2 border-border overflow-hidden"
                />
            </div>
        {:else}
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <CalendarDays class="h-5 w-5 text-violet-500" />
            </div>
        {/if}
        
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
                <a href="/dashboard/calendars/{calendarId}"><h4 class="font-medium truncate underline">{actualCalendar.name}</h4></a>
                {#if !actualCalendar.filters.hideUnpublished}
                    <div class="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>•</span>
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger>
                                    <TriangleAlert class="h-4 w-4 text-yellow-600" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>This calendar can expose unpublished events. To change this, edit the filter settings of this calendar.</Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>
                {/if}
                {#if actualCalendar.passwordEnabled}
                    <div class="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>•</span>
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger>
                                    <Shield class="h-4 w-4 text-yellow-600" />
                                </Tooltip.Trigger>
                                <Tooltip.Content>This calendar is password protected, but wont require a password in this image feed. If you dont want this calendar exposed without a password block, remove this calendar immediently!</Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>
                {/if}
            </div>
            <p class="text-sm text-muted-foreground">
                {actualCalendar.visits} visits
            </p>
        </div>

        <Button variant="outline" title="Remove Calendar" onclick={() => removeAdditionalCalendar(calendarId)}><X /></Button>
    </div>
{/if}