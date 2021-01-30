<script>
    import Course from './Course.svelte';
    export let user;
</script>

<div class="p-8">
    <h1 class="text-center text-3xl">{user.name}'s Courses</h1>
    {#each user.courses as course}
        <Course course={course} />
    {:else}
        <p class="text-center">please wait...</p>
    {/each}
</div>