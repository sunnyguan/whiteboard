<script>
    import PinsList from './PinsList.svelte';
    export let user;
</script>

<div class="mt-4">
    <img src={user.avatar} alt="profile picture" class="mx-auto rounded-full" />
    <div class="mt-4">
        {#each user.courses as course}
            <PinsList course={course} />
        {/each}
    </div>
</div>
