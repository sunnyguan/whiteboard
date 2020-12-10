import { urlPrefix, email, user_id, username, avatar_link, processTemplate, createElementFromHTML, fetchSidebarCourses, addToLinks } from './utils.js';

var course_main = `
    <div class="mdl-grid demo-content">
        <div class="contents demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        </div>
    </div>
`;

// load course contents
export default function course(template, courseId) {
    var courseName = "";
    fetch(urlPrefix + "/learn/api/public/v1/courses/" + courseId).then(response => response.json()).then(data => {
        courseName = data["name"]
        return fetch(urlPrefix + "/learn/api/public/v1/courses/" + courseId + "/contents").then(response => response.json());
    }).then(data => {
        processTemplate(template, course_main);
        document.getElementsByClassName("mdl-layout-title")[0].textContent = courseName;
        document.title = courseName;

        var allLinks = document.querySelector(".contents");
        for (var res of data["results"]) {
            var href = urlPrefix + "/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + res.id;
            var newElement = createElementFromHTML(`
                <div class="content demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--6-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--cyan-100">
                        <i class="mdl-color-text--blue-grey-400 material-icons pin" style="position: absolute;right: 10px;top: 10px;color: orange !important; cursor: pointer">push_pin</i>
                        <h2 class="contentTitle mdl-card__title-text">${res.title}</h2>
                    </div>
                    <div class="contentContent mdl-card__supporting-text mdl-color-text--grey-600">
                        No content details found
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href="${href}" class="contentLink mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>
                    </div>
                </div>`
            );

            newElement.querySelector(".pin").addEventListener('click', function (event) {
                var t = event.target;
                addToLinks(t.getAttribute("href"), t.getAttribute("courseid"), t.getAttribute("title"), courseId);
            });

            allLinks.appendChild(newElement);
        }
        if (!data["results"] || data["results"].length === 0) {
            document.querySelector(".contents").appendChild(createElementFromHTML(`
                <h4 style="
                    width: 100%;
                    font-weight: 300;
                    text-align: center;
                ">No information found.</h4>`)
            );
        }
        return fetchSidebarCourses(courseId);
    })
}