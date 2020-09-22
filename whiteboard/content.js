console.log('Whiteboard extension loaded!');

// only replace page if starts with /webapps
if (window.location.href.startsWith("https://elearning.utdallas.edu/webapps")) {
    start();
}

// for displaying user info, might add more uses later
var id = "";
var email = "";

function start() {
    fetch(chrome.extension.getURL("loading.html"))
        .then(response => response.text())
        .then(template => {
            document.open()
            document.write(template)
            document.close()
        });

    console.log("Fetching your unique id...")
    fetch("https://elearning.utdallas.edu/webapps/blackboard/execute/personalInfo")
        .then(response => response.text())
        .then(result => getUserId(result))
        .catch(error => console.log("you're not logged in."));
}

// save user ID for API calls
function getUserId(result) {
    avatarid = result.match("key=(.*?), dataType=blackboard.data.user.User");
    console.log(avatarid);
    if (!avatarid || avatarid.length < 2) {
        console.log("Not logged in");
    } else {
        email = result.match("Email: (.*?@utdallas\\.edu)")[1];
        console.log(email);
        id = avatarid[1];
        replacePage();
    }
}

// logic for choosing page to replace
function replacePage() {
    var href = window.location.href;
    var replaceUrl = "home";
    var courseId = "";
    var contentId = "";
    var iframeSrc = "";
    var title = "";

    if (href.startsWith("https://elearning.utdallas.edu/webapps/portal/execute/tabs/tabAction")) {
        replaceUrl = "home";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/blackboard/content/listContent")) {
        if (href.includes("content_id")) {
            var courseAndContent = href.split("?")[1].split("&");

            // deals with external links switching course_id and content_id
            if (courseAndContent[0].includes("course_id")) {
                courseId = courseAndContent[0].split("=")[1];
                contentId = courseAndContent[1].split("=")[1];
            } else {
                courseId = courseAndContent[1].split("=")[1];
                contentId = courseAndContent[0].split("=")[1];
            }

            replaceUrl = "content";
        } else {
            courseId = href.split("?")[1].split("=")[1];
            replaceUrl = "course";
        }
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/blackboard/execute/announcement")) {
        courseId = href.split("?")[1].split("&");
        for (var id of courseId) {
            if (id.includes("course_id")) {
                courseId = id.split("=")[1];
                break;
            }
        }
        replaceUrl = "announcement";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/calendar")) {
        iframeSrc = "https://elearning.utdallas.edu/webapps/calendar/viewMyBb?globalNavigation=false";
        title = "Calendar";
        replaceUrl = "iframe";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/assignment/uploadAssignment")) {
        iframeSrc = href;
        title = "Assignment";
        replaceUrl = "iframe";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/discussionboard")) {
        iframeSrc = href;
        title = "Discussion Board";
        replaceUrl = "iframe";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/collab-ultra/tool/collabultra")) {
        iframeSrc = href;
        title = "BlackBoard Collab";
        replaceUrl = "iframe";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/assessment/take/launchAssessment")) {
        iframeSrc = href;
        title = "Assessment";
        replaceUrl = "iframe";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/bb-mygrades-BBLEARN")) {
        iframeSrc = href;
        title = "My Grades";
        replaceUrl = "iframe";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/gradebook")) {
        iframeSrc = href;
        title = "Gradebook";
        replaceUrl = "iframe";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/blackboard/content/contentWrapper")) {
        iframeSrc = href;
        title = "Content";
        replaceUrl = "iframe";
    }
    else {
        // no suitable replacement found, use iframe fallback
        iframeSrc = href;
        title = "Blackboard";
        replaceUrl = "iframe";
    }

    fetch(chrome.extension.getURL(replaceUrl + "/index.html"))
        .then(function (response) {
            switch (response.status) {
                case 200:
                    return response.text();
                case 404:
                    throw response;
            }
        })
        .then(function (template) {
            if (replaceUrl === "home")
                home(template);
            else if (replaceUrl === "course")
                course(template, courseId);
            else if (replaceUrl === "content")
                content(template, courseId, contentId);
            else if (replaceUrl === "announcement")
                announcement(template, courseId);
            else if (replaceUrl === "iframe")
                iframe(template, iframeSrc, title);
        })
        .catch(function (response) {
            console.log(response.statusText);
        });
}

// loads html from storage, puts in email, render quick add calendar popup
function processTemplate(template) {
    document.open()
    document.write(template)
    document.close()
    var emailElement = document.getElementById("student-email");
    console.log(emailElement.innerText);
    emailElement.innerText = email;
    render_calendar_addon();
}

// util function to make element from HTML
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// util function to format date
function formatDate(d) {
    var month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

// fetch week at a glance
function processAgenda() {
    var lastSun = new Date();
    lastSun.setDate(lastSun.getDate() - lastSun.getDay());
    var lastSunday = formatDate(lastSun);
    lastSun.setDate(lastSun.getDate() + 7);
    var nextSunday = formatDate(lastSun);

    lastSun = new Date(lastSunday);
    var nextSun = new Date(nextSunday);

    return fetch("https://elearning.utdallas.edu/learn/api/public/v1/calendars/items?since=" + lastSunday + "&until=" + nextSunday).then(response => response.json()).then(data => {
        if ("results" in data) {
            for (var cls of data["results"]) {
                var name = cls.title;
                var course = cls.calendarName.split(".")[0];
                var color = cls.color;
                var dateStart = cls.start.split("T")[0];
                var jsDate = new Date(cls.end);
                jsDate.setTime(jsDate.getTime() - 5 * 60 * 60 * 1000);
                var dist = jsDate.getDay();
                if (jsDate.getTime() > lastSun.getTime() && jsDate.getTime() < nextSun.getTime()) {
                    var newElement = createElementFromHTML(`<p class="employee design box" style="white-space: pre; background-color: ${color}; font-size: 12px">Saturday</p>`);
                    var processName = name;
                    if (processName.length > 15) {
                        processName = processName.substring(0, 18) + "...";
                    }
                    newElement.textContent = processName + "\n" + course;
                    document.getElementsByClassName("calendar-week")[0].children[dist].querySelector(".employee").insertAdjacentElement("afterend", newElement);

                    window.getComputedStyle(newElement).opacity; // added
                    newElement.className += ' in';
                }
            }
        }
        document.getElementsByClassName("calendar-week")[0].children[new Date().getDay()].querySelector(".day > div").style.backgroundColor = "#dfdfdf";
    })

}

// logic for adding event to calendar
function render_calendar_addon() {
    document.querySelector("#addEvent").addEventListener('click', function (event) {
        event.preventDefault();
        var title = document.getElementById("first").value;
        var desc = document.getElementById("last").value;
        var start = document.getElementById("start").value + ":00"; // 2020-09-17T16:30:00
        var end = document.getElementById("end").value + ":01"; // 2020-09-17T17:00:00
        return fetch("https://elearning.utdallas.edu/webapps/calendar/viewMyBb?globalNavigation=false").then(resp => resp.text()).then(data => {
            var id = data.match("nonceVal = \"(.*?)\"")[1];
            return fetch("https://elearning.utdallas.edu/webapps/calendar/calendarData/event", {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en-US,en;q=0.9",
                    "blackboard.platform.security.nonceutil.nonce.ajax": id,
                    "content-type": "application/json;charset=UTF-8",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": "https://elearning.utdallas.edu/webapps/calendar/viewMyBb?globalNavigation=false",
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": `{"calendarId":"PERSONAL","title":"${title}","description":"${desc}","start":"${start}","end":"${end}",
                    "allDay":false,"recur":false,"freq":"WEEKLY","interval":"1","byDay":["TH"],"monthRepeatBy":"BYMONTHDAY",
                    "byMonthDay":"1","bySetPos":"1","endsBy":"COUNT","count":"10","untilDate":"2020-11-17T16:15:00"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(resp => resp.text()).then(data => {
                console.log(data);
                alert("Added!");
                document.getElementById("mycard").style.display = document.getElementById("mycard").style.display === 'none' ? '' : 'none';
            }).catch(err => { console.log(err); alert("Error!"); })
        });
    });

    document.getElementById("hdrbtn").addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById("mycard").style.display = document.getElementById("mycard").style.display === 'none' ? '' : 'none';
    })
}

// dashboard page (home)
function home(template) {
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/" + id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
        processTemplate(template);
        var bbScrape = document.createElement("iframe");
        bbScrape.id = "bbFrame";
        bbScrape.style.display = 'none';
        bbScrape.src = "https://elearning.utdallas.edu/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1";
        document.getElementsByTagName("body")[0].appendChild(bbScrape);
        document.title = "Dashboard";

        var courseArr = data.results;
        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });

        // add the "real" classes first
        for (var course of courseArr) {
            // NOTE: this could break if the 2208 pattern changes!
            if (!course.course.courseId.startsWith('2208-')) continue;
            var newElement = createElementFromHTML(
                `<div class="zoomDiv course demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--6-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--teal-300">
                        <h2 class="courseTitle mdl-card__title-text">${course.course.name}</h2>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href="https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=${course.course.id}" class="float-left courseLink1 mdl-button mdl-js-button mdl-js-ripple-effect">Homepage</a>
                        <a href="https://elearning.utdallas.edu/webapps/blackboard/execute/announcement?course_id=${course.course.id}" class="float-right courseLink2 mdl-button mdl-js-button mdl-js-ripple-effect">Announcements</a>
                    </div>
                </div>`
            );
            // newElement.querySelector(".courseContent").textContent = "Course content goes here"; // what to put here?
            document.querySelector(".courseAll").appendChild(newElement);
        }
        // add the other stuff at the bottom
        for (var course of courseArr) {
            // NOTE: this could break if the 2208 pattern changes!
            if (course.course.courseId.startsWith('2208-')) continue;

            var newElement = createElementFromHTML(
                `<div class="zoomDiv group demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--4-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--blue-300">
                        <h2 class="groupTitle mdl-card__title-text">${course.course.name}</h2>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href="https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=${course.course.id}" class="groupLink mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>
                    </div>
                </div>`
            );
            // newElement.querySelector(".groupContent").textContent = "Course content goes here"; // what to put here?
            document.querySelector(".groupAll").appendChild(newElement);
        }
        return processAgenda().then(data => { return fetchSidebarCourses().then(resp => { return loadAnnouncementCards(); }) });
    })
}

// load the top announcement card sliders
function loadAnnouncementCards() {
    if (courseIds.length == 0)
        return;

    var announcement_fetches = [];
    var announcements = document.getElementById("announcementDiv");
    for (var courseId of Object.keys(courseIds)) {
        announcement_fetches.push("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/announcements?sort=modified(desc)");
    }
    document.querySelector("#announcementLoad").style.display = 'none';

    return Promise.all(announcement_fetches.map(url => fetch(url).then(resp => resp.json()).then(res => {
        if (!("results" in res && res["results"].length >= 1))
            return;

        var card1info = res["results"][0];
        var courseId = url.split("courses/")[1].split("/")[0];
        var createdDate = new Date(card1info.created);
        var newElement = createElementFromHTML(
            `<div class="slide box zoomDiv group demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--3-col-desktop"
                style="min-height:170px; padding-top: 0px; padding-bottom: 0px;"></div>`);
        var card1 = createElementFromHTML(
            `<div class="first card">
                <div class="mdl-card__title mdl-card--expand mdl-color--teal-300" 
                    style="background-color: orange !important; background: none; min-height: 120px;"
                    onclick="location.href='https://elearning.utdallas.edu/webapps/blackboard/execute/announcement?course_id=${courseId}'">
                    <div style="position: absolute; right: 0; top: 0; font-weight: 300; font-family: Roboto; font-size: 14px; margin: 8px;">
                        ${(createdDate.getMonth() + 1) + "/" + createdDate.getDate()}
                    </div>
                    <h2 class="mdl-card__title-text" style="font-size: 20px">${card1info.title}</h2>
                </div>
                <div class="switch mdl-card__supporting-text mdl-color-text--grey-600" style="width: 100%; text-align: left;">
                    ${courseIds[courseId]}
                    <i class="arrow material-icons" style="position: absolute; right: 10px; bottom: 13px;">arrow_right_alt</i>
                </div>
            </div>`
        )
        newElement.appendChild(card1);

        // add second card
        if (res["results"].length >= 2) {
            var card2info = res["results"][1];
            var createdDate = new Date(card2info.created);
            var card2 = createElementFromHTML(
                `<div class="second card">
                    <div class="mdl-card__title mdl-card--expand mdl-color--teal-300" 
                        style="background-color: orange !important; background: none; min-height: 120px;"
                        onclick="location.href='https://elearning.utdallas.edu/webapps/blackboard/execute/announcement?course_id=${courseId}'">
                        <div style="position: absolute; right: 0; top: 0; font-weight: 300; font-family: Roboto; font-size: 14px; margin: 8px;">
                            ${(createdDate.getMonth() + 1) + "/" + createdDate.getDate()}
                        </div>
                        <h2 class="mdl-card__title-text" style="font-size: 20px">${card2info.title}</h2>
                    </div>
                    <div class="switch mdl-card__supporting-text mdl-color-text--grey-600" style="width: 100%; text-align: right;">
                        ${courseIds[courseId]}
                        <i class="material-icons" style="position: absolute; left: 10px; bottom: 13px; transform: rotate(180deg)">arrow_right_alt</i>
                    </div>
                </div>`
            )
            card2.querySelector(".switch").onclick = function (e) {
                card1.classList.toggle("animate");
                card2.classList.toggle("animate");
            }
            card1.querySelector(".switch").onclick = function (e) {
                card1.classList.toggle("animate");
                card2.classList.toggle("animate");
            }
            newElement.appendChild(card2);
        } else {
            // remove sliding arrow indicator if only 1 card
            card1.querySelector(".arrow").style.display = "none";
        }

        announcements.appendChild(newElement);
        window.getComputedStyle(newElement).opacity; // added animation
        newElement.className += ' in';
    })));
}

// load course contents
function course(template, courseId) {
    var courseName = "";
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId).then(response => response.json()).then(data => {
        courseName = data["name"]
        return fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents").then(response => response.json());
    }).then(data => {
        processTemplate(template);
        document.getElementsByClassName("mdl-layout-title")[0].textContent = courseName;
        document.title = courseName;
        var allLinks = document.querySelector(".allLinks");
        for (var res of data["results"]) {
            var href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + res.id;
            var newElement = createElementFromHTML(`
                <div class="content demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--6-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--teal-300">
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

            allLinks.appendChild(newElement);
        }
        return fetchSidebarCourse(courseId);
    })
}

// load a content (can mean a lot of things! almost everything that is a "page" is a content)
function content(template, courseId, contentId) {
    fetch("https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + contentId).then(resp => resp.text()).then(data => {
        processTemplate(template);
        var xmlString = data;
        var doc = new DOMParser().parseFromString(xmlString, "text/html");
        document.getElementsByClassName("mdl-layout-title")[0].textContent = doc.getElementById("courseMenu_link").textContent;
        document.title = doc.getElementById("courseMenu_link").textContent;
        var list = doc.querySelectorAll("#content_listContainer > li");
        for (var item of list) {

            // basic framework
            var newElement = createElementFromHTML(
                `<div class="information demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--teal-300">
                        <h2 class="informationTitle mdl-card__title-text">${item.querySelector("div > h3").textContent}</h2>
                    </div>
                    <div class="informationContent mdl-card__supporting-text mdl-color-text--grey-600">
                        ${item.querySelector(".details").innerHTML}
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

                var read_more = createElementFromHTML(
                    `<div class="informationLinks mdl-card__actions mdl-card--border">
                        <a href="${item.querySelector("div > h3 > a").href}" class="informationLink mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>
                    </div>`
                );
                newElement.querySelector(".pin").setAttribute("href", item.querySelector("div > h3 > a").href);
                newElement.querySelector(".pin").setAttribute("courseid", courseId);
                newElement.querySelector(".pin").setAttribute("title", item.querySelector("div > h3").textContent);
                newElement.querySelector(".pin").addEventListener('click', function (event) {
                    var t = event.target;
                    addToLinks(t.getAttribute("href"), t.getAttribute("courseid"), t.getAttribute("title"));
                });
                newElement.appendChild(read_more);
            }

            // add attachments
            var attachments = item.querySelectorAll(".attachments > li");
            if (attachments && attachments.length != 0) {
                attachments.forEach(file => {
                    var attached = createElementFromHTML(
                        `<div class="informationLinks mdl-card__actions mdl-card--border">
                            <a href="${file.querySelector("a").href}" class="informationLink mdl-button mdl-js-button mdl-js-ripple-effect">${file.querySelector("a").textContent.trim()}</a>
                        </div>`
                    );
                    newElement.appendChild(attached);
                });
                var toRemove = newElement.querySelector(".informationContent > .contextItemDetailsHeaders");
                toRemove.parentNode.removeChild(toRemove);
            }

            document.querySelector(".informationAll").appendChild(newElement);
        }
        return fetchSidebarCourse(courseId);
    });
}

// add link to pinned
function addToLinks(link, courseId, name) {
    chrome.storage.sync.get({
        links: {}
    }, function (result) {
        var newlinks = result.links;
        if (!(courseId in newlinks)) {
            newlinks[courseId] = [];
        }
        newlinks[courseId] = newlinks[courseId].filter(function (el) { return el.link != link; });
        newlinks[courseId].push({ link: link, title: name });
        chrome.storage.sync.set({
            links: newlinks
        }, function () {
            console.log("new link added");
            console.log(newlinks);
            fetchSidebarCourse(courseId);
        });
    });
}

// remove link from pinned
function removeFromLinks(link, courseId, name) {
    chrome.storage.sync.get({
        links: {}
    }, function (result) {
        var newlinks = result.links;
        if (!(courseId in newlinks))
            return;
        newlinks[courseId] = newlinks[courseId].filter(function (el) { return el.link != link; });
        console.log(newlinks[courseId]);
        console.log({ link: link, title: name });
        chrome.storage.sync.set({
            links: newlinks
        }, function () {
            console.log("link removed");
            console.log(newlinks);
            fetchSidebarCourse(courseId);
        });
    });
}

// fetch sidebar items for a course
function fetchSidebarCourse(courseId) {
    var homeLink = document.querySelector(".allLinks");
    while (homeLink.children.length > 2) {
        homeLink.removeChild(homeLink.lastChild);
    }

    chrome.storage.sync.get({
        links: {}
    }, function (result) {
        var newLinks = [];
        if (courseId in result.links) {
            var links = result.links[courseId];
            if (links.length != 0) {
                console.log(links);
                newLinks = result.links[courseId];
            } else {
                console.log("links is empty!");
            }
        }

        return fetch("https://elearning.utdallas.edu/webapps/blackboard/content/courseMenu.jsp?course_id=" + courseId).then(response => response.text()).then(html => {
            var xmlString = html;
            var doc = new DOMParser().parseFromString(xmlString, "text/html");
            var ul = doc.getElementById("courseMenuPalette_contents");
            if (ul) {
                var li = ul.getElementsByTagName("li");

                // add pinned links first
                for (var pinned of newLinks) {
                    var element = createElementFromHTML(
                        `<div class="mdl-navigation__link" style="color: orange">
                            <i class="mdl-color-text--blue-grey-400 material-icons pin" 
                            style="padding: 0; color: red !important; cursor: pointer; transform: rotate(-90deg);" href="${pinned.link}" courseid="${courseId}" title="${pinned.title}">
                                push_pin
                            </i>
                            <a class="mdl-navigation__link" style="padding: 0" href="${pinned.link}">${pinned.title}</a>
                        </div>`
                    );
                    homeLink.appendChild(element);
                    element.querySelector(".pin").addEventListener('click', function (event) {
                        var t = event.target;
                        removeFromLinks(t.getAttribute("href"), t.getAttribute("courseid"), t.getAttribute("title"));
                    });
                }

                // then add course's own links
                for (var i of li) {
                    var a = i.querySelector('a');
                    if (a) {
                        var element = createElementFromHTML(`<a class="mdl-navigation__link" href="${a.href}">${a.textContent}</a>`);
                        homeLink.appendChild(element);
                    } else {
                        var divider = createElementFromHTML(`<hr>`);
                        homeLink.appendChild(divider);
                    }
                }
            }
        })
    });
}

// fetch list of courses for sidebar (home page and iframe)
function fetchSidebarCourses() {
    return fetchCourseList().then(courses => {
        var allLinks = document.querySelector('.allLinks');
        uiCourses = courses;
        for (var c of uiCourses) {
            var newElement = createElementFromHTML(`
                <a class="mdl-navigation__link" href="${c.href}">
                    ${c.textContent}
                </a>`
            );
            allLinks.appendChild(newElement);
        }
    });
}

var courseIds = {};

// fetch list of courses
function fetchCourseList() {
    return fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/" + id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
        var courseArr = data.results;

        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });
        var courses = [];
        for (var c of courseArr) {
            // NOTE: this could break if the 2208 pattern changes!
            console.log(c.course.availability);
            console.log(c.course.name);
            if (!c.course.courseId.startsWith('2208-') || c.course.availability.available === "No")
                continue;
            var newElement = {};
            newElement.href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + c.course.id;
            newElement.textContent = c.course.name.split("-")[0]; // TODO figure out better way to trim course name
            courses.push(newElement);

            if (!(c.course.id in courseIds)) {
                courseIds[c.course.id] = c.course.name.split("-")[0];
            }
        }
        return courses;
    });
}

// announcement page (very similar to content, might improve later)
function announcement(template, courseId) {
    fetch("https://elearning.utdallas.edu/webapps/blackboard/execute/announcement?method=search&context=course_entry&course_id=" + courseId + "&handle=announcements_entry&mode=view")
        .then(resp => resp.text()).then(data => {
            processTemplate(template);
            var xmlString = data;
            var doc = new DOMParser().parseFromString(xmlString, "text/html");
            document.getElementsByClassName("mdl-layout-title")[0].textContent = doc.getElementById("courseMenu_link").textContent;
            document.title = doc.getElementById("courseMenu_link").textContent;
            var list = doc.querySelectorAll("#announcementList > li");
            for (var item of list) {

                var newElement = createElementFromHTML(
                    `<div class="box information demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop">
                        <div class="mdl-card__title mdl-card--expand mdl-color--teal-300">
                            <h2 class="informationTitle mdl-card__title-text">${item.querySelector("h3").textContent}</h2>
                        </div>
                        <div class="informationContent mdl-card__supporting-text mdl-color-text--grey-600">
                            ${item.querySelector(".details").innerHTML}
                        </div>
                    </div>`
                );
                document.querySelector(".informationAll").appendChild(newElement);
                window.getComputedStyle(newElement).opacity; // added
                newElement.className += ' in';
            }
            return fetchSidebarCourse(courseId);
        })
}

// fallback to links not implemented
function iframe(template, iframeSrc, title) {
    processTemplate(template);
    document.getElementById('header_title').textContent = title;
    document.title = title;
    var iframe = document.getElementById("iframe");
    iframe.src = iframeSrc;
    iframe.onload = function () {
        iframe.contentDocument.getElementById('contentPanel').style.margin = "0";
        iframe.contentDocument.getElementById('navigationPane').style.display = "none";
        iframe.contentDocument.getElementById('breadcrumbs').style.display = "none";
        iframe.contentDocument.getElementById('learn-oe-body').style.backgroundColor = "white";

        // add grade percentage logic
        if (title === "My Grades") {
            iframe.contentDocument.querySelectorAll(".cell.grade").forEach(element => {
                var g = element.querySelector(".grade")
                var o = element.querySelector(".pointsPossible")
                if (g && o) {
                    var percentage = eval(g.textContent + o.textContent) * 100 + "%";
                    var percentElement = createElementFromHTML(`
                        <span class="grade" tabindex="0" style="font-weight: 300; color: black; font-size: 14px;">${percentage}</span>`
                    )
                    element.appendChild(percentElement);
                }
            });
        }
    }
    return fetchSidebarCourses();
}