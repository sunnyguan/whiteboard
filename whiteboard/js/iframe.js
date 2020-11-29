import { urlPrefix, email, user_id, username, avatar_link, processTemplate, createElementFromHTML, fetchSidebarCourses } from './utils.js';

var iframe_main = `
    <iframe id="iframe" src="" style="width: 100%; height: 100%">
`;

// fallback to links not implemented
export default function iframe(template, iframeSrc, title, courseId) {
    processTemplate(template, iframe_main);
    document.getElementById('header_title').textContent = title;
    document.title = title;
    var iframe = document.getElementById("iframe");
    iframe.src = iframeSrc;
    iframe.onload = function () {
        if (iframe.contentDocument.getElementById('contentPanel'))
            iframe.contentDocument.getElementById('contentPanel').style.margin = "0";
        if (iframe.contentDocument.getElementById('navigationPane'))
            iframe.contentDocument.getElementById('navigationPane').style.display = "none";
        if (iframe.contentDocument.getElementById('breadcrumbs'))
            iframe.contentDocument.getElementById('breadcrumbs').style.display = "none";
        if (iframe.contentDocument.getElementById('learn-oe-body'))
            iframe.contentDocument.getElementById('learn-oe-body').style.backgroundColor = "white";

        // add grade percentage logic
        if (title === "My Grades") {
            iframe.contentDocument.querySelectorAll(".cell.grade").forEach(element => {
                var g = element.querySelector(".grade")
                var o = element.querySelector(".pointsPossible")
                if (g && o) {
                    try {
                        var percentage = eval(g.textContent + o.textContent) * 100 + "%";
                        var percentElement = createElementFromHTML(`
                            <span class="grade" tabindex="0" style="font-weight: 300; color: black; font-size: 14px;">${percentage}</span>`
                        )
                        element.appendChild(percentElement);
                    } catch (err) { }
                }
            });
        }
    }
    return fetchSidebarCourses(courseId);
}
