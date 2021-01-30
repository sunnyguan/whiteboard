<script>
    import Course from './Course.svelte';
    export let user;
</script>

<div class="p-8">
    {#each user.courses as course}
        <Course course={course} />
    {:else}
        <p class="text-center">please wait...</p>
    {/each}
</div>