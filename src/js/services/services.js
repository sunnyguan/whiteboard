import { formatDate } from './utils';
import User from './user.js';
import Course from './course.js';

export const URL_PREFIX = "https://elearning.utdallas.edu"

export async function fetchUserInfo() {
    const response = await fetch(URL_PREFIX + "/webapps/blackboard/execute/personalInfo");
    const result = await response.text();

    const nameMatch = result.match("class=global-top-avatar />(.*?)<span");
    const user_id = result.match("key=(.*?), dataType=blackboard.data.user.User")[1];
    const avatar_link = result.match('src="(/avatar/.*?user.*?)"')[1];

    let courses = await fetchCourseList(user_id); // course data objects, not Course
    let pins = await fetchCoursePins();
    let merged = merge(courses, pins);
    return new User(user_id, nameMatch[1], merged, avatar_link);
}

export async function fetchCourseList(user_id) {
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

async function fetchCoursePins() {
    return []; // await chrome.storage.local.get({ courses: [] }, result => result.courses);
}

function merge(courses, pins) {
    let dict = {};
    pins.forEach(pin => { dict[pin.name] = pin });
    let result = [];
    for (let course of courses) {
        let name = course.course.name;
        let newCourse = new Course(course.course.id, name);
        if (name in dict) {
            newCourse.pins = dict[name];
        }
        result.push(newCourse);
    }
    return result;
}

export async function fetchCalendar() {
    let tempDate = new Date();

    tempDate.setDate(tempDate.getDate() - tempDate.getDay());
    let lastSundayFormat = formatDate(tempDate);
    tempDate.setDate(tempDate.getDate() + 7);
    let nextSundayFormat = formatDate(tempDate);

    let lastSun = new Date(lastSundayFormat);
    let nextSun = new Date(nextSundayFormat);

    const data = await fetch(`${URL_PREFIX}/learn/api/public/v1/calendars/items?since=${lastSundayFormat}&until=${nextSundayFormat}`).then(response => response.json());
    if (!("results" in data)) {
        return [];
    }

    let results = [];
    for (let i = 0; i < 7; i++)
        results.push([]);

    for (let cal_item of data["results"]) {
        let item_date = new Date(cal_item.end);
        item_date.setTime(item_date.getTime() - 5 * 60 * 60 * 1000);

        if (item_date.getTime() > lastSun.getTime() && item_date.getTime() < nextSun.getTime()) {
            let item = {
                color: cal_item.color,
                id: cal_item.id,
                name: cal_item.title,
                course: cal_item.calendarName.split(".")[0],
                url: `${URL_PREFIX}/webapps/calendar/launch/attempt/_blackboard.platform.gradebook2.GradableItem-${cal_item.id}`,
                dynamic: false
            };
            if ("dynamicCalendarItemProps" in cal_item) {
                item.dynamic = true;
            } else {
                item.url = "";
            }
            results[item_date.getDay()].push(item);
        }
    }
    console.log(results);
    return results;
}

async function fetchGrade(courseId) {
    const data = await fetch(`${URL_PREFIX}/webapps/bb-mygrades-BBLEARN/myGrades?course_id=${courseId}&stream_name=mygrades&is_stream=false`).then(resp => resp.text());
    var doc = new DOMParser().parseFromString(data, "text/html");
    var overallRows = doc.querySelector(".calculatedRow > .cell.grade");
    var grade = "N/A";
    if (overallRows && overallRows.textContent.trim() !== "-") 
        grade = overallRows.textContent.trim();
    return grade;
}

export async function fetchGrades(user) {
    let res = [];
    for (let course of user.courses) {
        let grade = await fetchGrade(course.id);
        if (grade !== "N/A") {
            res.push({
                name: course.name,
                grade: grade
            });
        }
    }
    return res;
}