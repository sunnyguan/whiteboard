<script>
    const fetchUserInfo = (async () => {
        // const response = await fetch("https://dog.ceo/api/breeds/image/random");
        // return await response.json();
        
        const response = await fetch("https://elearning.utdallas.edu/webapps/blackboard/execute/personalInfo");
        const result = await response.text();
        const nameMatch = result.match("class=global-top-avatar />(.*?)<span");
        return nameMatch[1];
    })();
</script>

<style>
    h1 {
        color: pink;
    }
</style>

{#await fetchUserInfo}
    <p>...please wait...</p>
{:then data} 
    <h1>Good morning, {data}!</h1>
{/await}