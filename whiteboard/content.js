console.log('Whiteboard extension loaded!');
console.log(chrome.extension.getURL("home/index.html"))


if (window.location.href.startsWith("https://elearning.utdallas.edu/webapps")) {
    start();
}

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

function replacePage() {
    var href = window.location.href;
    var replaceUrl = "home";
    var foundReplacement = true;
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
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/collab-ultra/tool/collabultra")){
        iframeSrc = href;
        title = "BlackBoard Collab";
        replaceUrl = "iframe";
    }
    else {
        foundReplacement = false;
    }

    if (foundReplacement) {
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
}

// loads html from storage and puts in email 
function processTemplate(template) {
    document.open()
    document.write(template)
    document.close()
    var emailElement = document.getElementById("student-email");
    console.log(emailElement.innerText);
    emailElement.innerText = email;
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; 
  }

function waitForElementToDisplay(time) {
    if (document.querySelector("#bbFrame") != null && document.getElementById("bbFrame").contentDocument.getElementById("whatsNewModule") != null
        && document.getElementById("bbFrame").contentDocument.getElementById("whatsNewModule").textContent.length > 2000) {
        console.log(document.getElementById("bbFrame").contentDocument.getElementById("whatsNewModule").textContent);
        var ul = document.getElementById("bbFrame").contentDocument.getElementById("blocklist::2-whatsNewView:::::AN"); // => <a href="#">Link...
        var li = ul.getElementsByTagName("li");
        var aul = document.getElementById("announcementUl");
        console.log(li);
        var idx = 0;
        for (var i of li) {
            var title = i.querySelector("span > a");
            var course = i.querySelector("span > div > a");
            var courseId = course.href.split("?")[1].split("id=")[1].split("&")[0]
            var newElement = createElementFromHTML(`<li class="announcement mdl-list__item mdl-list__item--three-line">
                                                        <span class="mdl-list__item-primary-content">
                                                            <i class="material-icons mdl-list__item-avatar">person</i>
                                                            <span class="announcementTitle">Sample</span>
                                                            <span class="announcementContent mdl-list__item-text-body">
                                                                Bryan Cranston played the role of Walter in Breaking Bad. He is also known
                                                                for playing Hal in Malcom in the Middle.
                                                            </span>
                                                        </span>
                                                        <span class="mdl-list__item-secondary-content">
                                                            <a class="announcementLink mdl-list__item-secondary-action" href="#"><i class="material-icons">arrow_right_alt</i></a>
                                                        </span>
                                                    </li>`);
            newElement.querySelector(".announcementTitle").textContent = title.textContent
            newElement.querySelector(".announcementContent").textContent = course.textContent
            newElement.querySelector(".announcementLink").href = "https://elearning.utdallas.edu/webapps/blackboard/execute/announcement?course_id=" + courseId;
            aul.appendChild(newElement);
            idx++;
            if (idx > 3) {
                break;
            }
        }
        document.querySelector("#announcementLoad").style.display = 'none';
        aul.style.textAlign = "";
        return;
    }
    else {
        console.log('nope');
        setTimeout(function () {
            waitForElementToDisplay(time);
        }, time);
    }
}

// all courses
function home(template) {
    // NautilusViewService.getViewInfo(null, null, ["GB::GB_ATT_UPDATED", "GB::GB_GRA_UPDATED", "GB::GB_GRA_CLEARED", "CO::CO_AVAIL", "CM::CM_RCVD", "CR::CR_AVAIL", "AS::AS_AVAIL", "AS::AS_AVAIL_RESEND", "AS::AS_GA_AVAIL", "AS::AS_GA_AVAIL_RESEND", "AS::AS_GA_ATTEMPT", "AS::AS_GA_LATE_ATTEMPT", "AN::AN_AVAIL", "TE::TE_AVAIL", "TE::TE_AVAIL_RESEND", "SU::SU_AVAIL"], document.location.href,
    // false, response => { console.log(response) });
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/" + id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
        processTemplate(template);
        var bbScrape = document.createElement("iframe");
        bbScrape.id = "bbFrame";
        bbScrape.style.display = 'none';
        bbScrape.src = "https://elearning.utdallas.edu/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1";
        waitForElementToDisplay(500);
        document.getElementsByTagName("body")[0].appendChild(bbScrape);

        var res = "";
        var fetchArr = [];
        var courseArr = data.results;

        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });

        // add the "real" classes first
        for (var c of courseArr) {
            // NOTE: this could break if the 2208 pattern changes!
            if (!c.course.courseId.startsWith('2208-')) continue;

            var elements = document.querySelectorAll(".course");
            var element = elements[elements.length - 1];
            var newElement = null;
            if (element.querySelector(".courseTitle").textContent == "Sample") {
                newElement = element;
            } else {
                newElement = element.cloneNode(true);
            }
            newElement.querySelector(".courseTitle").textContent = c.course.name;
            newElement.querySelector(".courseContent").textContent = "Course content goes here";
            newElement.querySelector(".courseLink1").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + c.course.id;
            newElement.querySelector(".courseLink2").href = "https://elearning.utdallas.edu/webapps/blackboard/execute/announcement?course_id=" + c.course.id;
            element.insertAdjacentElement("afterend", newElement);
        }
        // add the other stuff at the bottom
        for (var c of courseArr) {
            console.log(c);
            // NOTE: this could break if the 2208 pattern changes!
            if (c.course.courseId.startsWith('2208-')) continue;

            console.log(c.course.courseid, c.course.name);
            var elements = document.querySelectorAll(".group");
            var element = elements[elements.length - 1];
            var newElement = null;
            if (element.querySelector(".groupTitle").textContent == "Sample") {
                newElement = element;
            } else {
                newElement = element.cloneNode(true);
            }
            newElement.querySelector(".groupTitle").textContent = c.course.name;
            newElement.querySelector(".groupContent").textContent = "Course content goes here";
            newElement.querySelector(".groupLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + c.course.id;
            element.insertAdjacentElement("afterend", newElement);
        }

        return fetchSidebarCourses();
    })
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
        for (var res of data["results"]) {
            var elements = document.querySelectorAll(".content");
            var element = elements[elements.length - 1];
            var newElement = element.cloneNode(true);
            // not deleting first element because reserved for announcements
            /* if (element.querySelector(".contentTitle").textContent == "Sample") {
                newElement = element;
            } else {
                newElement = element.cloneNode(true);
            }*/
            if (elements.length === 1) {
                element.querySelector(".contentLink").href = "https://elearning.utdallas.edu/webapps/blackboard/execute/announcement?course_id=" + courseId;
            }
            newElement.querySelector(".contentTitle").textContent = res.title;
            newElement.querySelector(".contentContent").textContent = "Content details goes here";
            newElement.querySelector(".contentLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + res.id;
            element.insertAdjacentElement("afterend", newElement);
        }
        return fetchSidebarCourse(courseId);
    })
}

// load a content (can mean a lot of things! almost everything that is a "page" is a content)
function content(template, courseId, contentId) {
    var courseName = "";
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId).then(response => response.json()).then(data => {
        courseName = data["name"]
        return fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents/" + contentId + "/children").then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Something went wrong');
            }
        }).then(data => {
            return content_hasChildren(template, courseId, data, courseName)
        }).catch(error => {
            return fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents/" + contentId).then(response => response.json()).then(data => {
                return content_noChildren(template, courseId, contentId, data, courseName)
            })
        });
    })
}

function content_hasChildren(template, courseId, data, courseName) {
    if (!("results" in data)) {
        return fetchSidebarCourse(courseId);
    }
    // has children (Course Homepage)
    processTemplate(template);
    document.getElementsByClassName("mdl-layout-title")[0].textContent = courseName;
    for (var res of data["results"]) {
        var elements = document.querySelectorAll(".information");
        var element = elements[elements.length - 1];
        var newElement = null;

        // TODO: find better way to replace first element
        if (element.querySelector(".informationTitle").textContent == "Sample") {
            newElement = element;
        } else {
            newElement = element.cloneNode(true);
        }
        newElement.querySelector(".informationTitle").textContent = res.title;
        if (res.body) {
            newElement.querySelector(".informationContent").innerHTML = res.body;
        } else {
            newElement.querySelector(".informationContent").innerHTML = "No descriptions available.";
        }
        if ("contentHandler" in res && "id" in res.contentHandler && res.contentHandler.id == "resource/x-bb-assignment")
            newElement.querySelector(".informationLink").href = "https://elearning.utdallas.edu/webapps/assignment/uploadAssignment?content_id=" + res.id + "&course_id=" + courseId;
        else
            newElement.querySelector(".informationLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + res.id;
        element.insertAdjacentElement("afterend", newElement);
    }
    return fetchSidebarCourse(courseId);
}

function content_noChildren(template, courseId, contentId, data, courseName) {
    // no children (Homework 1)
    processTemplate(template);
    if ("title" in data) {
        document.getElementsByClassName("mdl-layout-title")[0].textContent = courseName + " > " + data.title;

        var elements = document.querySelectorAll(".information");
        var element = elements[elements.length - 1];
        element.querySelector(".informationTitle").textContent = data.title;
        if (data.body) {
            element.querySelector(".informationContent").innerHTML = data.body;
        } else {
            element.querySelector(".informationContent").innerHTML = "No descriptions available.";
        }

        // if content has an external link (CS 3341's Assignments)
        if ("contentHandler" in data && "url" in data["contentHandler"]) {
            element.querySelector(".informationLink").href = data["contentHandler"]["url"];
            element.querySelector(".informationLink").textContent = "External Link";
        }
        return fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents/" + contentId + "/attachments")
            .then(response => response.json()).then(attachments => {
                if ("results" in attachments) {
                    content_noChildren_attachments(attachments, courseId, contentId);
                }
                return fetchSidebarCourse(courseId);
            })
    }
    return fetchSidebarCourse(courseId);
}

function content_noChildren_attachments(attachments, courseId, contentId) {
    // has attachments
    for (var attach of attachments["results"]) {
        var links = document.querySelectorAll(".informationLinks");
        var link = links[links.length - 1];
        var newLink = null;
        // TODO: find better way to replace first link (maybe display:none --> display:block?)
        if (link.querySelector(".informationLink").textContent == "Read More") {
            newLink = link;
        } else {
            newLink = link.cloneNode(true);
        }
        newLink.querySelector(".informationLink").href = "https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents/" + contentId + "/attachments/" + attach.id + "/download";
        newLink.querySelector(".informationLink").textContent = "Attachment: " + attach.fileName;
        link.insertAdjacentElement("afterend", newLink);
    }
}

function fetchSidebarCourse(courseId) {
    return fetch("https://elearning.utdallas.edu/webapps/blackboard/content/courseMenu.jsp?course_id=" + courseId).then(response => response.text()).then(html => {
        var xmlString = html;
        var doc = new DOMParser().parseFromString(xmlString, "text/html");
        var ul = doc.getElementById("courseMenuPalette_contents"); // => <a href="#">Link...
        var li = ul.getElementsByTagName("li");
        // some courses have dividers (CS 3341) in course list
        var divider = null;

        for (var i of li) {
            var a = i.querySelector('a');
            var elements = document.querySelectorAll(".mdl-navigation__link");
            var element = elements[elements.length - 2];
            var newElement = element.cloneNode();
            if (a) {
                newElement.href = a.href;
                newElement.textContent = a.textContent;
                element.insertAdjacentElement("afterend", newElement);
            } else {
                divider = element;
            }
        }

        if (divider) {
            divider.insertAdjacentElement("afterend", document.createElement('hr'));
        }
    })
}

var INTERVAL = 1;

function fetchSidebarCourses() {
    var uiCourses = [];
    chrome.storage.sync.get({
        lastSave: 0,
        courses: []
    }, function (items) {
        var diff = ((new Date().getTime() - items.lastSave)) / 1000.0 / 60;
        console.log("Time since last update: " + diff + " minutes");
        if (diff >= INTERVAL || items.courses.length == 0) {
            console.log("More than " + INTERVAL + " minutes, updating courses...");
            updateCourses().then(courses => {
                uiCourses = courses;
                for (var c of uiCourses) {
                    var elements = document.querySelectorAll(".mdl-navigation__link");
                    var element = elements[elements.length - 2];
                    var newElement = element.cloneNode();
                    newElement.href = c.href
                    newElement.textContent = c.textContent
                    element.insertAdjacentElement("afterend", newElement);
                }
                chrome.storage.sync.set({
                    lastSave: new Date().getTime(),
                    courses: courses
                }, function () {
                    console.log("Courses updated, next update in " + INTERVAL + " minutes.");
                });
            })
        } else {
            uiCourses = items.courses;
            console.log("Less than " + INTERVAL + " minutes, not updating courses.");

            for (var c of uiCourses) {
                var elements = document.querySelectorAll(".mdl-navigation__link");
                var element = elements[elements.length - 2];
                var newElement = element.cloneNode();
                newElement.href = c.href
                newElement.textContent = c.textContent
                element.insertAdjacentElement("afterend", newElement);
            }
        }
    });
}

function updateCourses() {
    return fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/" + id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
        var courseArr = data.results;

        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });
        var courses = [];
        for (var c of courseArr) {
            // NOTE: this could break if the 2208 pattern changes!
            if (!c.course.courseId.startsWith('2208-')) continue;
            var newElement = {};
            newElement.href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + c.course.id;
            newElement.textContent = c.course.name.split("-")[0]; // TODO figure out better way to trim course name
            courses.push(newElement);
        }
        return courses;
    });
}

function announcement(template, courseId) {
    var courseName = "";
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId).then(response => response.json()).then(data => {
        courseName = data["name"]
        return fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/announcements").then(response => response.json());
    }).then(data => {
        return content_hasChildren(template, courseId, data, courseName);
    })
}

function iframe(template, iframeSrc, title) {
    processTemplate(template);
    document.getElementById('header_title').textContent = title;
    var iframe = document.getElementById("iframe");
    iframe.src = iframeSrc;
    iframe.onload = function () {
        iframe.contentDocument.getElementById('contentPanel').style.margin = "0";
        iframe.contentDocument.getElementById('navigationPane').style.display = "none";
        iframe.contentDocument.getElementById('breadcrumbs').style.display = "none";
        iframe.contentDocument.getElementById('learn-oe-body').style.backgroundColor = "white";
    }
    return fetchSidebarCourses();
    // https://elearning.utdallas.edu/webapps/calendar/viewMyBb?globalNavigation=false
}