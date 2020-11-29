import { urlPrefix, email, user_id, username, avatar_link, processTemplate, createElementFromHTML, fetchSidebarCourses, addToLinks } from './utils.js';

var content_main = `
    <div class="mdl-grid demo-content">
        <div class="informationAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        </div>
    </div>
`;

// load a content (can mean a lot of things! almost everything that is a "page" is a content)
export default function content(template, courseId, contentId) {
    // console.log("course: " + courseId + "; content: " + contentId);
    fetch(urlPrefix + "/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + contentId).then(resp => resp.text()).then(data => {
        processTemplate(template, content_main);
        var xmlString = data;
        var doc = new DOMParser().parseFromString(xmlString, "text/html");
        document.getElementsByClassName("mdl-layout-title")[0].textContent = doc.getElementById("courseMenu_link").textContent;
        document.title = doc.getElementById("courseMenu_link").textContent;
        var list = doc.querySelectorAll("#content_listContainer > li");
        for (var item of list) {
            var hasContent = item.querySelector(".details").textContent.trim() !== "";
            // basic framework
            var newElement = createElementFromHTML(
                `<div class="information demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--6-col-desktop" style="min-height: 153px">
                    <div class="cardTitle mdl-card__title mdl-card--expand mdl-color--cyan-100" style="min-height: 100px; max-height: 100px">
                        <h2 class="informationTitle mdl-card__title-text">${item.querySelector("div > h3").textContent}</h2>
                    </div>
                    <div class="cardInfo informationContent mdl-card__supporting-text mdl-color-text--grey-600" style="overflow-y: auto; height: 100%; ${!hasContent ? `padding: 0` : ''}">
                        ${item.querySelector(".details").innerHTML}
                    </div>
                    <div class="informationLinks mdl-card__actions mdl-card--border" style="height: 53px; min-height: 53px; max-height: 53px;">
                    </div>
                </div>`
            );

            // add link
            if (item.querySelector("div > h3 > a") && item.querySelector("div > h3 > a").hasAttribute("href")) {
                var pushpin = createElementFromHTML(
                    `<i class="mdl-color-text--blue-grey-400 material-icons pin" 
                        style="position: absolute;right: 10px;top: 10px;color: orange !important; cursor: pointer">push_pin
                    </i>`
                );
                newElement.querySelector(".mdl-card__title").insertBefore(pushpin, newElement.querySelector(".mdl-card__title").firstChild);

                var read_more = createElementFromHTML(`
                        <a href="${item.querySelector("div > h3 > a").href}" class="informationLink mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--primary">Read More</a>
                `);
                newElement.querySelector(".pin").setAttribute("href", item.querySelector("div > h3 > a").href);
                newElement.querySelector(".pin").setAttribute("courseid", courseId);
                newElement.querySelector(".pin").setAttribute("title", item.querySelector("div > h3").textContent);
                newElement.querySelector(".pin").addEventListener('click', function (event) {
                    var t = event.target;
                    // console.log(t);
                    addToLinks(t, courseId);
                });
                newElement.querySelector(".informationLinks").appendChild(read_more);
            }

            // add attachments
            var attachments = item.querySelectorAll(".attachments > li");
            if (attachments && attachments.length != 0) {
                attachments.forEach(file => {
                    var attached = createElementFromHTML(
                        `<a href="${file.querySelector("a").href}" class="informationLink mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--secondary">${file.querySelector("a").textContent.trim()}</a>`
                    );
                    newElement.querySelector(".informationLinks").appendChild(attached);
                });
                var toRemove = newElement.querySelector(".informationContent > .contextItemDetailsHeaders");
                toRemove.parentNode.removeChild(toRemove);
            }

            document.querySelector(".informationAll").appendChild(newElement);
        }
        return fetchSidebarCourses(courseId);
    });
}