<script>
    import { onMount } from "svelte";
    import { fetchCalendar } from "../js/services/services";
    import { WEEKDAYS } from "../js/services/utils";

    let items = [];
    let dayOfWeek = new Date().getDay();

    onMount(async () => {
        items = await fetchCalendar();
    });
</script>

<div class="p-4 rounded-lg">
    <h1 class="text-2xl text-center font-bold mb-4">Weekly Agenda</h1>
    <div class="grid grid-cols-7 gap-4">
        {#each items as day, id}
            <div class="rounded-lg shadow-md p-4 {id == dayOfWeek ? `bg-indigo-300` : `bg-blue-100`}">
                <h1 class="text-lg text-center font-semibold">{WEEKDAYS[id]}</h1>
                {#each day as item}
                    <div class="bg-pink-100 hover:bg-pink-200 cursor-pointer p-2 my-4 rounded-md shadow-sm">
                        <p class="text-md font-bold">{item.course}</p> <span class="font-light text-md">{item.name}</span>
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
