import { urlPrefix, email, user_id, username, avatar_link, processTemplate, createElementFromHTML, fetchSidebarCourses } from './utils.js';

var discussion_main = `
<div class="mdl-grid demo-content">
    <div class="informationAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
    </div>
</div>
`;

export default function discussion(template, courseId) {
    fetch(`${urlPrefix}/webapps/discussionboard/do/conference?toggle_mode=read&action=list_forums&course_id=${courseId}&nav=discussion_board_entry&mode=view`).then(resp => resp.text()).then(data => {
        processTemplate(template, discussion_main);
        // document.getElementById('header_title').textContent = title;
        // document.title = title;
        var doc = new DOMParser().parseFromString(data, "text/html");
        console.log(doc);
        var boards = doc.getElementById("listContainer_databody");
        boards = boards ? boards.children : [];
        for (var board of boards) {
            var title = board.querySelector(".dbheading").textContent.trim();
            var link = board.querySelector(".dbheading > a").href;
            var html = board.querySelector(".vtbegenerated");
            html = html ? html.innerHTML : "";
            var totalPosts = board.querySelector(".total-count").textContent.trim();
            var unreadCount = board.querySelectorAll(".unread-count")[0].textContent.trim();
            var unreadToMe = board.querySelectorAll(".unread-count")[1].textContent.trim();
            var partCount = board.querySelector(".participants-count").textContent.trim();
            var newElement = createElementFromHTML(`
                <div class="information demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--6-col-desktop" style="min-height: 153px">
                    <div class="mdl-card__title mdl-card--expand mdl-color--cyan-100" style="min-height: 100px; max-height: 100px">
                        <h2 class="informationTitle mdl-card__title-text">${title}</h2>
                    </div>
                    <div class="informationContent mdl-card__supporting-text mdl-color-text--grey-600" style="overflow-y: auto; height: 100%">
                        ${html}
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href="${link}" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                            ${totalPosts} Posts
                        </a>
                        <a href="${link}" class="mdl-button mdl-js-button mdl-js-ripple-effect" style="color: rebeccapurple">
                            ${unreadToMe} Unread
                        </a>
                    </div>
                </div>
            `);
            document.querySelector(".informationAll").appendChild(newElement);
        }
        if (!board || board.length === 0) {
            document.querySelector(".informationAll").appendChild(createElementFromHTML(`
            <h4 style="
                width: 100%;
                font-weight: 300;
                text-align: center;
            ">No information found.</h4>`)
            );
        }
        fetchSidebarCourses(courseId);
    })
}