<script>
    import { onMount } from "svelte";
    import { fetchGrades } from '../js/services/services.js';

    export let user;
    let grades;

    onMount(async () => {
        grades = await fetchGrades(user);
        console.log(grades);
    });
</script>

<div class="p-4 rounded-xl grid grid-cols-2 gap-4 my-2">
    {#if grades}
        {#each grades as grade}
            <div class="bg-blue-100 shadow-md rounded-lg flex p-2">
                <div class="flex-1 text-xl">{grade.name}</div>
                <div class="text-xl">{grade.grade}</div>
            </div>
        {/each}
    {/if}
</div>