<script lang="ts">
    import type { CalendarDBModel } from "./utils";

    let {
        calendar,
        addToCalsToAdd
    }: {
        calendar: CalendarDBModel,
        addToCalsToAdd: (event: Event, calId: string) => unknown
    } = $props();

    let checked = $state(false);
</script>

<div class="w-full border rounded {checked ? "border-green-400" : ""}">
    <input
        type="checkbox"
        name="caltoadd{calendar.id}"
        id="caltoadd{calendar.id}"
        class="sr-only"
        bind:checked={checked}
        onchange={(event) => addToCalsToAdd(event, calendar.id)}
    />
    <label for="caltoadd{calendar.id}" class="w-full h-full block p-2 flex items-center gap-2 cursor-pointer">
        <div class="dot w-3 h-3 {checked ? "bg-green-600" : "bg-accent"} rounded-xl"></div>
        {calendar.name}
    </label>
</div>