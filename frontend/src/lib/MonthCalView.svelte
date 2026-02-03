<script lang="ts">
    import { Temporal } from "temporal-polyfill";
    import MonthCalViewDay from "./MonthCalViewDay.svelte";
    import type { EventDBModel } from "./utils";

    let {
        events,
        timeZone,
        currentDate,
    }: {
        events: EventDBModel[],
        timeZone: Temporal.TimeZoneLike,
        currentDate: Temporal.ZonedDateTime
    } = $props();

    function getDaysInMonth(date: Temporal.ZonedDateTime): Temporal.ZonedDateTime[] {
        const year = date.year;
        const month = date.month;

        const firstDay = date.with({ day: 1 });
        const lastDay = date.with({ day: date.daysInMonth });
        
        const days: Temporal.ZonedDateTime[] = []
        
        // Add days from previous month to start on Sunday
        const startDayOfWeek = 7 - firstDay.dayOfWeek
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const prevDate = Temporal.Now.zonedDateTimeISO(timeZone).subtract({ days: i }).startOfDay() //new Date(year, month, -i)
            days.push(prevDate)
        }
        
        // Add days of current month
        for (let i = 1; i <= lastDay.day; i++) {
            days.push(Temporal.ZonedDateTime.from({
                year: year,
                month: month,
                day: i,
                timeZone,
            }));
        }
        
        // Add days from next month to complete the grid
        const remainingDays = 42 - days.length
        for (let i = 1; i <= remainingDays; i++) {
            days.push(Temporal.ZonedDateTime.from({
                year: year,
                month: month + 1,
                day: i,
                timeZone,
            }));
        }
        return days
    }
    let days = $derived(getDaysInMonth(currentDate))
</script>

<div class="dark h-full">
    <div class="overflow-hidden h-screen">
        <div class="grid grid-cols-7 dark bg-foreground">
            {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as day (`aweekday${day}`)}
                <div class="text-center py-2 text-xs text-muted-foreground dark font-semibold text-white border-b border-[#333333]">
                    {day}
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-7 h-full">
            {#each days as day, index (`adayinmonth${index}`)}
                <MonthCalViewDay {index} {events} {day} {currentDate} />
            {/each}
        </div>
    </div>
</div>