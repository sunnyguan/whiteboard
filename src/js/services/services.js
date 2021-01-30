import User from './user.js';

export const URL_PREFIX = "https://elearning.utdallas.edu"

export async function fetchUserInfo() {
    const response = await fetch(URL_PREFIX + "/webapps/blackboard/execute/personalInfo");
    const result = await response.text();

    const nameMatch = result.match("class=global-top-avatar />(.*?)<span");
    const user_id = result.match("key=(.*?), dataType=blackboard.data.user.User")[1];
    const avatar_link = result.match('src="(/avatar/.*?user.*?)"')[1];

    const courses = await fetchCourseList(user_id);
    return new User(user_id, nameMatch[1], courses, avatar_link);
}

export async function fetchCourseList (user_id) {
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