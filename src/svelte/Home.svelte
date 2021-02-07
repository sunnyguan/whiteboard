<script>
    import Course from './Course.svelte';
    import Agenda from './Agenda.svelte';
    import Grade from './Grade.svelte';
    export let user;
</script>

<div class="p-8">
    <h1 class="text-center text-3xl mb-4">{user.name}'s Dashboard</h1>
    <Agenda />
    <Grade user={user}/>
</div>