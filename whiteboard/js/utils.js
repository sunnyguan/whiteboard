export const urlPrefix = "https://elearning.utdallas.edu";

var allAnnouncements = [];
var readAlready = [];

export let email = "";
export let user_id = "";
export let username = "";
export let avatar_link = "";
export let options = {};
export let courseIds = {};

export function setUserInfo(e, uid, un, avt, opt) {
    email = e;
    user_id = uid;
    username = un;
    avatar_link = avt;
    options = opt;
}

// loads html from storage, puts in email, render quick add calendar popup
export function processTemplate(template, main) {
    document.getElementsByTagName("html")[0].innerHTML = template;
    document.querySelector("main").innerHTML = main;

    var emailElement = document.getElementById("student-email");
    emailElement.innerText = email;
    var nameElement = document.getElementById("student-name");
    nameElement.innerText = username;
    var avatarElement = document.getElementById("student-avatar");
    avatarElement.src = avatar_link;

    Array.from(document.querySelectorAll('.notification-tab')).forEach(function (a) {
        a.addEventListener('click', function (e) {
            if (e.currentTarget.parentNode.classList.contains('expanded')) {
                Array.from(document.querySelectorAll('.notification-group')).forEach(function (a) { a.classList.remove('expanded'); })
            }
            else {
                Array.from(document.querySelectorAll('.notification-group')).forEach(function (a) { a.classList.remove('expanded'); })
                e.currentTarget.parentNode.classList.toggle('expanded');
            }
        })
    })

    var toggle_sidebar = document.getElementById('expand_sidebar');
    var sidebar = document.getElementById("style-3");
    var header = document.querySelector(".mdl-layout__header-row");
    var main_content = document.querySelector("main.mdl-layout__content");
    toggle_sidebar.addEventListener('click', function (e) {
        e.preventDefault();
        if (sidebar.style.display === 'none') {
            sidebar.style.display = 'initial';
            header.classList.add('padded');
            header.classList.remove('no-padded');
            main_content.style.marginLeft = "240px";
            toggle_sidebar.textContent = "arrow_left";
        } else {
            sidebar.style.display = 'none';
            header.style.paddingLeft = "0px";
            header.classList.add('no-padded');
            header.classList.remove('padded');
            main_content.style.marginLeft = "0px";
            toggle_sidebar.textContent = "arrow_right";
        }
    })

    return chrome.storage.local.get({ reads: [] }, function (result) {
        readAlready = result.reads;
        Array.from(document.querySelectorAll("a[data-dropdown='notificationMenu']")).forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                var el = e.target;

                document.querySelector("#dropdownOverlay").addEventListener('click', function (e) {
                    container.classList.remove("expanded");
                    document.querySelector("#dropdownOverlay").style.display = "none";
                    readAllAnnouncements();
                });

                var container = e.currentTarget.parentNode;
                var dropdown = document.querySelector('.dropdown');
                var containerWidth = container.offsetWidth
                var containerHeight = container.offsetHeight

                dropdown.style.right = containerWidth / 2 + 'px';

                if (container.classList.contains("expanded")) {
                    container.classList.remove("expanded");
                    document.querySelector("#dropdownOverlay").style.display = "none";
                } else {
                    container.classList.add("expanded")
                    document.querySelector("#dropdownOverlay").style.display = "block";
                }
            })
            return checkLatestRelease().then(_ => {
                if(options["showNotifications"]) {
                    return processNotifications()
                } else {
                    document.getElementById("notifBell").outerHTML = "";
                }
            });
        })
    });


    // check latest versions

}

function readAllAnnouncements() {
    chrome.storage.local.get({ reads: [] }, function (result) {
        var newReads = result.reads;
        for (var anmt of allAnnouncements)
            if (!newReads.includes(anmt))
                newReads.push(anmt);
        newReads = newReads.slice(-50)
        readAlready = newReads
        allAnnouncements = []

        chrome.storage.local.set({
            reads: newReads
        }, function () {
            console.log("added read announcements");
        });
    });
}

// converts version number "xx.xx.xx" into an integer
function verToNumber(str) {

    var arr = str.split(".");
    var res = 0;
    for (var i = 0; i < arr.length; i++)
        res += Math.pow(100, arr.length - 1 - i) * arr[i];
    return res;
}

function checkLatestRelease() {
    return fetch(chrome.extension.getURL("manifest.json")).then(data => data.json()).then(current => {
        var appVersion = current["version"];
        document.querySelector("#stableUpdate").innerText = "Version: " + appVersion;
        document.querySelector("#stableUpdate").href = "#";
        document.querySelector("#stableUpdate").style.color = "rgb(144, 255, 101, 0.7)";
        document.querySelector("#stableUpdate").style.borderColor = "rgb(144, 255, 101, 0.7)";
        refreshNavLinks();
        render_calendar_addon();
    });
    
    // return fetch("https://api.github.com/repos/sunnyguan/whiteboard/releases/latest").then(d => d.json()).then(release => {
    //     var latestVersion = verToNumber(release["tag_name"].substring(1));
    //     return fetch("https://raw.githubusercontent.com/sunnyguan/whiteboard/master/whiteboard/manifest.json").then(data => data.json()).then(beta => {
    //         var betaVersion = verToNumber(beta["version"]);
    //         return fetch(chrome.extension.getURL("manifest.json")).then(data => data.json()).then(current => {
    //             var appVersion = verToNumber(current["version"])
    //             console.log("Latest: " + latestVersion);
    //             console.log("Current: " + appVersion);

    //             // testing
    //             // latestVersion = verToNumber("1.0.0");
    //             // betaVersion = verToNumber("1.0.7");
    //             // appVersion = verToNumber("1.0.5");

    //             if (appVersion < latestVersion) {
    //                 document.querySelector("#stableUpdate").innerText = "Major Update Available!";
    //                 document.querySelector("#stableUpdate").href = release.assets[0].browser_download_url;
    //                 document.querySelector("#stableUpdate").style.color = "rgb(255, 78, 103)";
    //                 document.querySelector("#stableUpdate").style.borderColor = "rgba(255,3,3,70%)";
    //             } else if (appVersion < betaVersion) {
    //                 document.querySelector("#stableUpdate").innerText = "Beta Available!";
    //                 document.querySelector("#stableUpdate").href = "https://github.com/sunnyguan/whiteboard/raw/master/whiteboard.zip";
    //                 // document.querySelector("#stableUpdate").style.color = "rgb(78, 255, 103)";
    //                 // document.querySelector("#stableUpdate").style.borderColor = "rgba(3,255,3,70%)";
    //                 document.querySelector("#stableUpdate").style.color = "rgb(144, 255, 101, 0.7)";
    //                 document.querySelector("#stableUpdate").style.borderColor = "rgb(144, 255, 101, 0.7)";
    //             } else if (appVersion > betaVersion) {
    //                 // easter egg : )
    //                 document.querySelector("#stableUpdate").innerText = "Developer Mode";
    //                 document.querySelector("#stableUpdate").style.borderImage = "linear-gradient(to right bottom, rgb(184, 39, 252) 0%, rgb(44, 144, 252) 25%, rgb(184, 253, 51) 50%, rgb(254, 200, 55) 75%, rgb(253, 24, 146) 100%) 1 / 1 / 0 stretch";
    //                 document.querySelector("#stableUpdate").style.borderImageSlice = "1";
    //                 document.querySelector("#stableUpdate").style.color = "yellow";
    //             } else {
    //                 document.querySelector("#stableUpdate").innerText = "On Latest Version";
    //                 document.querySelector("#stableUpdate").style.color = "rgb(0, 78, 103)";
    //                 document.querySelector("#stableUpdate").style.borderColor = "initial";
    //             }
    //             refreshNavLinks();
    //             render_calendar_addon();
    //         })
    //     })
    // });
}

function refreshNavLinks() {
    var navListWithSubNav = document.querySelectorAll('.mdl-navigation__list .has-subnav');
    Array.from(navListWithSubNav).forEach(function (item) {
        var listItem = item;
        var toggleButton = item.querySelector('.js-toggle-subnav');
        var subnav = item.querySelector('.mdl-navigation__list');
        if (item.getAttribute('has-click-listener') !== 'true') {
            item.setAttribute('has-click-listener', 'true');
            toggleButton.addEventListener('click', function (event) {
                if (listItem.classList.contains('is-opened')) {
                    listItem.classList.remove('is-opened');
                    toggleButton.classList.remove('is-active');
                } else {
                    // open this one
                    listItem.classList.add('is-opened');
                    toggleButton.classList.add('is-active');
                }
            })
        }
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
        return fetch(urlPrefix + "/webapps/calendar/viewMyBb?globalNavigation=false").then(resp => resp.text()).then(data => {
            var id = data.match("nonceVal = \"(.*?)\"")[1];
            return fetch(urlPrefix + "/webapps/calendar/calendarData/event", {
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
                "referrer": urlPrefix + "/webapps/calendar/viewMyBb?globalNavigation=false",
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": `{"calendarId":"PERSONAL","title":"${title}","description":"${desc}","start":"${start}","end":"${end}",
                    "allDay":false,"recur":false,"freq":"WEEKLY","interval":"1","byDay":["TH"],"monthRepeatBy":"BYMONTHDAY",
                    "byMonthDay":"1","bySetPos":"1","endsBy":"COUNT","count":"10","untilDate":"2020-11-17T16:15:00"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(resp => resp.text()).then(data => {
                alert("Added!");
                document.getElementById("mycard").style.display = document.getElementById("mycard").style.display === 'none' ? '' : 'none';
            }).catch(err => { console.log(err); alert("Error!"); })
        });
    });

    document.getElementById("hdrbtn").addEventListener('click', function (event) {
        event.preventDefault();

        document.querySelector("#dropdownOverlay").addEventListener('click', function (e) {
            document.getElementById("dropdownOverlay").style.display = 'none';
            document.getElementById("mycard").style.display = "none";
        })
        document.getElementById("mycard").style.display = document.getElementById("mycard").style.display === 'none' ? 'block' : 'none';
        document.querySelector("#dropdownOverlay").style.display = document.getElementById("mycard").style.display === 'none' ? 'none' : 'block';
    })
}

function processNotifications() {
    var head = {
        "headers": {
            "accept": "text/javascript, text/html, application/xml, text/xml, */*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-prototype-version": "1.7",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "https://elearning.utdallas.edu/webapps/streamViewer/streamViewer?cmd=view&streamName=alerts&globalNavigation=false",
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": "cmd=loadStream&streamName=alerts&providers=%7B%7D&forOverview=false",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }

    return fetchRetry("https://elearning.utdallas.edu/webapps/streamViewer/streamViewer", 10, 5, head)
}

function wait(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

function fetchRetry(url, delay, tries, fetchOptions = {}) {
    var pms = [];
    for (var i = 0; i < tries; i++) {
        pms.push(wait(delay).then(() => fetch(url, fetchOptions).then(resp => resp.json())));
    }

    return Promise.all(pms).then(arr => {
        var largest = arr[0];
        for (var j = 1; j < arr.length; j++) {
            console.log("size: " + arr[j]["sv_streamEntries"].length);
            if (arr[j]["sv_streamEntries"].length > largest["sv_streamEntries"].length) {
                largest = arr[j];
            }
        }
        processRankedNotifications(largest)
    })
}

function processRankedNotifications(res) {
    var updates = res["sv_streamEntries"];
    updates.sort((a, b) => (a.se_timestamp > b.se_timestamp) ? -1 : ((b.se_timestamp > a.se_timestamp) ? 1 : 0));
    updates = updates.slice(0, 20);

    var messages = document.getElementById("messages");
    var anmts = document.getElementById("announcements");
    var msgCount = 0;
    var anmtCount = 0;
    var unreadCount = 0;
    for (var update of updates) {
        var time = timeSince(new Date(update.se_timestamp))
        var courseName = ("se_courseId" in update && update.se_courseId in courseIds) ? courseIds[update.se_courseId] : "No course info.";
        var innerInfo = createElementFromHTML("<div>" + update.se_context + "</div>");
        if (innerInfo.querySelector(".inlineContextMenu")) {
            var remove = innerInfo.querySelector(".inlineContextMenu");
            remove.parentNode.removeChild(remove);
        }

        var infoHTML = "";
        var appElement = messages;
        var id = "se_id" in update ? update.se_id : "";
        var url = "";
        if ("se_itemUri" in update)
            url = update["se_itemUri"];
        if (id !== "")
            allAnnouncements.push(id);
        if (innerInfo.textContent.trim().startsWith("Content")) {
            // content ... available
            var eventTitle = innerInfo.querySelector(".eventTitle");
            infoHTML = eventTitle.innerHTML;
            msgCount++;
        } else if (innerInfo.querySelector(".announcementTitle")) {
            // announcement
            infoHTML = innerInfo.querySelector(".announcementTitle").innerHTML
            appElement = anmts;
            anmtCount++;
        } else {
            infoHTML = innerInfo.innerHTML
            msgCount++;
        }

        var style = "";
        if (!readAlready.includes(id)) {
            style = "style='background: lightpink'";
            unreadCount++;
        }
        var element = createElementFromHTML(`
            <li class="notification-list-item" id="${id}" ${style}>
                <p class="message">${infoHTML}</p>
                <div class="item-footer">
                <span class="from"><a href="${url}">${courseName}</a></span>
                <span class="date">${time} ago</span>
                </div>
            </li>
        `)
        appElement.appendChild(element);
    }

    if (unreadCount !== 0) {
        document.querySelector(".circle").textContent = unreadCount;
        document.querySelector(".circle").style.backgroundColor = "red";
    }

    document.querySelector("#announcementsCount").textContent = anmtCount;
    document.querySelector("#messagesCount").textContent = msgCount;
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}
var aDay = 24 * 60 * 60 * 1000;

// util function to make element from HTML
export function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// util function to format date
export function formatDate(d) {
    let mm = ('0' + (d.getMonth() + 1)).slice(-2);
    let dd = ('0' + d.getDate()).slice(-2);
    let yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
}

// fetch list of courses for sidebar (home page and iframe)
export function fetchSidebarCourses(courseId = "") {
    document.querySelector('.allLinks').innerHTML = "";

    const urlParams = new URLSearchParams(location.search);
    const urlCourseId = urlParams.get('course_id');

    return fetchCourseList().then(courses => {
        var allLinks = document.querySelector('.allLinks');
        var currentCourse;
        var uiCourses = courses;
        if(!options['showGroupSidebar']) {
            uiCourses = uiCourses.filter(course => course.textContent.match("[A-Z]+ [0-9].[0-9]{2}\.") || course.id === urlCourseId);
        }
        uiCourses.sort((a, b) => {
            var aIsCourse = a.textContent.match("[A-Z]+ [0-9].[0-9]{2}\.");
            var bIsCourse = b.textContent.match("[A-Z]+ [0-9].[0-9]{2}\.");
            if(aIsCourse && bIsCourse) return a.textContent.localeCompare(b.textContent);
            if(!aIsCourse) return 1;
            return -1;
        })
        for (var c of uiCourses) {
            var classes = c.links.length > 0 || courseId !== "" ? 'class="has-subnav"' : "";
            var nav_uls = "";
            if (classes)
                nav_uls = '<ul class="mdl-navigation__list"></ul>';
            var newElement = createElementFromHTML(`
                <li ${classes} course="${c.id}">
                    <div class="mdl-navigation__link">
                        <a href="${c.href}" class="no-dec-link">
                            <i class="material-icons" role="presentation">subject</i>
                            ${c.textContent}
                        </a>
                        ${courseId !== "" || nav_uls !== "" ? `<div class="after js-toggle-subnav">
                            <i class="material-icons" role="presentation">expand_more</i>
                        </div>` : ""}
                    </div>
                    ${nav_uls}
                </li>
            `);
            for (var links of c.links) {
                var newLink = createElementFromHTML(`
                    <li>
                        <div class="mdl-navigation__link">
                            <i class="mdl-color-text--blue-grey-400 material-icons pin" 
                                style="padding: 0; color: red !important; cursor: pointer; transform: rotate(-90deg);" 
                                href="${links.link}" courseid="${c.id}" title="${links.title}">
                                    push_pin
                            </i>
                            <a href="${links.link}" class="no-dec-link">
                                ${links.title}
                            </a>
                        </div>
                    </li>
                    
                `);
                newLink.querySelector(".pin").addEventListener('click', function (event) {
                    var t = event.target;
                    removeFromLinks(t, courseId);
                });
                newElement.querySelector(".mdl-navigation__list").appendChild(newLink);
            }
            if (courseId !== "" && c.href.includes(courseId))
                currentCourse = newElement;
            allLinks.appendChild(newElement);
        }

        var promises = [];
        if (courseId !== "") {
            promises.push(fetch(urlPrefix + "/webapps/blackboard/content/courseMenu.jsp?course_id=" + courseId).then(response => response.text()).then(html => {
                var xmlString = html;
                var doc = new DOMParser().parseFromString(xmlString, "text/html");
                var ul = doc.getElementById("courseMenuPalette_contents");
                if (ul) {
                    var li = ul.getElementsByTagName("li");
                    for (var i of li) {
                        var a = i.querySelector('a');
                        if (a) {
                            var element = createElementFromHTML(`
                                <li style="position: relative">
                                    <div class="mdl-navigation__link">
                                        <a href="${a.href}" class="no-dec-link">
                                            <i class="material-icons" role="presentation">assistant</i>
                                            ${a.textContent}
                                        </a>
                                        <i class="mdl-color-text--blue-grey-400 material-icons pin" style="padding: 0;color: green !important; cursor: pointer; position: absolute;right: 0;top: 7px;" 
                                            href="${a.href}" courseid="${courseId}" title="${a.textContent}">
                                            push_pin
                                        </i>
                                    </div>
                                </li>
                            `);
                            element.querySelector(".pin").addEventListener('click', function (event) {
                                var t = event.target;
                                toggleLink(t);
                            });
                            if (currentCourse) {
                                var sideNav = currentCourse.querySelector(".mdl-navigation__list");
                                if (sideNav)
                                    sideNav.appendChild(element);
                            }
                        } else {
                            if (currentCourse) {
                                var divider = createElementFromHTML(`<hr>`);
                                var sideNav = currentCourse.querySelector(".mdl-navigation__list");
                                if (sideNav)
                                    sideNav.appendChild(divider);
                            }
                        }
                    }
                    if (currentCourse) {
                        currentCourse.classList.add('is-opened');
                        currentCourse.querySelector(".mdl-navigation__list").classList.add('is-active');
                    }
                }
                // allLinks.appendChild(newElement);
                // refreshNavLinks(false);
            }));
        }
        refreshNavLinks();
        Promise.all(promises);
    });
}

// fetch list of courses
function fetchCourseList() {
    return fetch(urlPrefix + '/learn/api/v1/users/' + user_id + '/memberships?availability.available=Yes&role=Student&expand=course').then(res => res.json()).then(data => {
        var courseArr = data.results;
        const now = new Date();
        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get({ links: {} }, function (result) {
                var courses = [];
                let mergedCourses = [];
                for (var c of courseArr) {
                    // NOTE: this could break if the 2212 pattern changes!
                    // TODO find better way to separate course/group
                    // console.log(c.course.name);
                    var unavailable = c.course.availability.available === "No";
                    var curSemester = new Date(c['course']['term']['startDate']) <= now && now <= new Date(c['course']['term']['endDate'])
                    var group = c.course.organization === true;
                    if (!curSemester && !group)
                        continue;

                    if (!options['showUnmerged'] && mergedCourses.some(val => c.course.name.indexOf(val) != -1)) 
                        continue;
                    var newElement = {};
                    newElement.id = c.course.id;
                    newElement.href = urlPrefix + "/webapps/blackboard/content/listContent.jsp?course_id=" + c.course.id;
                    newElement.textContent = c.course.name.split("-")[0].replace("(MERGED) ", ""); // TODO figure out better way to trim course name
                    newElement.links = (result.links[c.course.id] !== undefined) ? result.links[c.course.id] : [];
                    courses.push(newElement);

                    if (!(c.course.id in courseIds)) {
                        courseIds[c.course.id] = c.course.name.split("-")[0].replace("(MERGED) ", "");
                    }

                    // mark if this is a merged course. This logic blocks the unmerged courses from being seen
                    if (c.course.name.startsWith('(MERGED) ')) {
                        const matches = c.course.name.match(/[A-Z]{2,4} \d{4}\.\w{3}/g)
                        if (matches)
                            matches.forEach(m => mergedCourses.push(m));
                    }
                }
                resolve(courses);
            });
        });
    });
}

// add link to pinned
export function addToLinks(element, courseId) {
    var link = element.getAttribute("href");
    var courseId = element.getAttribute("courseid");
    var name = element.getAttribute("title");

    chrome.storage.local.get({ links: {} }, function (result) {
        var newlinks = {};
        var add_new = false;
        if (result.links !== {}) {
            newlinks = result.links;
            if (!(courseId in newlinks)) {
                newlinks[courseId] = [];
            }
            var oriSize = newlinks[courseId].length;
            newlinks[courseId] = newlinks[courseId].filter(function (el) { return el.link != link; });
            newlinks[courseId].push({ link: link, title: name });
            add_new = (oriSize !== newlinks[courseId].length);
        } else {
            newlinks[courseId] = [{ link: link, title: name }];
        }
        chrome.storage.local.set({
            links: newlinks
        }, function () {
            console.log("new link added");
            fetchSidebarCourses(courseId);
        });
    });
}

// remove link from pinned
export function removeFromLinks(element, courseId) {
    var link = element.getAttribute("href");
    var courseId = element.getAttribute("courseid");
    var name = element.getAttribute("title");

    chrome.storage.local.get({
        links: {}
    }, function (result) {
        var newlinks = result.links;
        if (!(courseId in newlinks))
            return;
        newlinks[courseId] = newlinks[courseId].filter(function (el) { return el.link != link; });
        chrome.storage.local.set({
            links: newlinks
        }, function () {
            console.log("link removed");
            fetchSidebarCourses(courseId);
            // element.parentNode.parentNode.parentNode.removeChild(element.parentNode.parentNode);
        });
    });
}

export function toggleLink(element, courseId) {
    var link = element.getAttribute("href");
    var courseId = element.getAttribute("courseid");
    var name = element.getAttribute("title");

    chrome.storage.local.get({
        links: {}
    }, function (result) {
        var newlinks = result.links;
        if (courseId in newlinks && newlinks[courseId].includes(link)) {
            removeFromLinks(element, courseId);
        } else {
            addToLinks(element, courseId);
        }
    });
}