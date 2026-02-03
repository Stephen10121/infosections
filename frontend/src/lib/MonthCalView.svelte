<script lang="ts">
    import MonthCalViewDay from "./MonthCalViewDay.svelte";
    import type { EventDBModel } from "./utils";

    let {
        events,
    }: {
        events: EventDBModel[],
    } = $props();

    function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days: Date[] = []
  
  // Add days from previous month to start on Sunday
  const startDayOfWeek = firstDay.getDay()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i)
    days.push(prevDate)
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }
  
  return days
}
    let currentDate = $state(new Date());
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let days = $derived(getDaysInMonth(currentDate))
</script>

<div class="dark">
    <div class="border rounded-lg overflow-hidden">
        <div class="grid grid-cols-7 bg-muted">
            {#each weekDays as day (`aweekday${day}`)}
                <div class="text-center py-2 text-xs font-medium text-muted-foreground border-b">
                    {day}
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-7">
            {#each days as day, index (`adayinmonth${index}`)}
                <MonthCalViewDay {index} {events} {day} {currentDate} />
            {/each}
        </div>
    </div>
</div>