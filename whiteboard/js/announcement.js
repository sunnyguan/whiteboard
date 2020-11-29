import { urlPrefix, email, user_id, username, avatar_link, processTemplate, createElementFromHTML, fetchSidebarCourses } from './utils.js';

var announcement_main = `
    <div class="mdl-grid demo-content">
        <div class="informationAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        </div>
    </div>
`;

// announcement page (very similar to content, might improve later)
export default function announcement(template, courseId) {
    fetch(urlPrefix + "/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=" + courseId + "&handle=announcements_entry&mode=view")
        .then(resp => resp.text()).then(data => {
            processTemplate(template, announcement_main);
            var xmlString = data;
            var doc = new DOMParser().parseFromString(xmlString, "text/html");
            document.getElementsByClassName("mdl-layout-title")[0].textContent = doc.getElementById("courseMenu_link").textContent;
            document.title = doc.getElementById("courseMenu_link").textContent;
            var list = doc.querySelectorAll("#announcementList > li");
            for (var item of list) {
                var newElement = createElementFromHTML(
                    `<div class="box information demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--6-col-desktop" style="min-height: 153px">
                        <div class="mdl-card__title mdl-card--expand mdl-color--cyan-100" style="max-height: 100px; min-height: 100px">
                            <h2 class="informationTitle mdl-card__title-text">${item.querySelector("h3").textContent}</h2>
                        </div>
                        <div class="informationContent mdl-card__supporting-text mdl-color-text--grey-600" style="height: 100%">
                            ${item.querySelector(".details").innerHTML}
                        </div>
                    </div>`
                );
                document.querySelector(".informationAll").appendChild(newElement);
                window.getComputedStyle(newElement).opacity; // added
                newElement.className += ' in';
            }
            if (!list || list.length === 0) {
                document.querySelector(".informationAll").appendChild(createElementFromHTML(`
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