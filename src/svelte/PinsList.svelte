<script>
    export let course;

    function shorten(name) {
        return name.split(".")[0];
    }
</script>

<div class="bg-blue-400 rounded-md m-4 p-2">
    <a href="www.google.com">{shorten(course.course.name)}</a>
</div>