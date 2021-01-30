<script>
    import { onMount } from 'svelte';
    import { fetchUserInfo } from '../js/services/services.js';
    import User from '../js/services/user.js';
    import Home from './Home.svelte'
    import Sidebar from './Sidebar.svelte';
    
    let user;

    onMount(async () => {
        user = await fetchUserInfo();
    });
</script>

<div class="bg-blue-100 min-h-screen flex">
    {#if user && user.courses}
        <div class="w-72">
            <Sidebar user={user} />
        </div>
        <div class="bg-green-100 flex-auto">
            <Home user={user} />
        </div>
    {:else}
        <p class="text-center w-full">loading...</p>
    {/if}
</div>