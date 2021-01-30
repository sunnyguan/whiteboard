<script>
    import PinsList from './PinsList.svelte';
    export let user;
</script>

<div class="bg-blue-300 h-full">
    <img src={user.avatar} alt="profile picture" class="mx-auto rounded-full pt-4" />
    <div class="mt-4">
        {#each user.courses as course}
            <PinsList course={course} />
        {/each}
    </div>
</div>
