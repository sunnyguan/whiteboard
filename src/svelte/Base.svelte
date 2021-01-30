<script>
    import { onMount } from 'svelte';
    import Course from './Course.svelte';
    
    const URL_PREFIX = "https://elearning.utdallas.edu"

    let name = "anonymoose";
    let id = "0";
    let courses = [];

    async function fetchUserInfo() {
        const response = await fetch(URL_PREFIX + "/webapps/blackboard/execute/personalInfo");
        const result = await response.text();
        const nameMatch = result.match("class=global-top-avatar />(.*?)<span");
        const user_id = result.match("key=(.*?), dataType=blackboard.data.user.User")[1];
        return {name: nameMatch[1], id: user_id};
    }

    async function fetchCourseList (user_id) {
        const course_data = fetch(URL_PREFIX + "/learn/api/public/v1/users/" + user_id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => data.results);
        let courseArr = await course_data;
        courseArr = courseArr.filter(c => {
            return c.course.courseId.startsWith('2212-');
        });
        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });
        return courseArr;
    }

    onMount(async () => {
        let info = await fetchUserInfo();
        name = info.name;
        id = info.id;
        courses = await fetchCourseList(id);
        console.log(courses);
    });
</script>

<div class="p-8">
    {#each courses as course}
        <Course course={course} />
    {:else}
        <p class="text-center">please wait...</p>
    {/each}
</div>