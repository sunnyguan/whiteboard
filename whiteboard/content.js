console.log('Whiteboard extension loaded!');

// for displaying user info, might add more uses later
var user_id = "";
var email = "";
var username = "";
var avatar_link = "";

var enabled = true;
const urlPrefix = "https://elearning.utdallas.edu";

// logic to determine if we should activate whiteboard on this page
chrome.storage.local.get(['enabled'], function (result) {
    enabled = !!result.enabled;
    console.log("Extension has been " + (enabled ? "en" : "dis") + "abled from the popup.");

    // only replace page if extension enabled and url starts with /webapps
    if (enabled && window.location.href.startsWith(urlPrefix)) {
        start();
    } else if (enabled && window.location.href.includes("coursebook.utdallas.edu")) {
        document.addEventListener('DOMContentLoaded', function () {
            startCB();
        });
    }
});

/* Coursebook Enhancement */
// console.log('Coursebook extension loaded!');

// change "cs xxx" to "csxxx" for coursebook searching
/* document.querySelector("#classsearch > a").onclick = function() {
    console.log('hi');
    var search = document.querySelector("#srch").value;
    if(search.startsWith("cs ")) document.querySelector("#srch").value = search.replace("cs ", "cs");
}*/
flag = false;
waiting = false;
function startCB() {
    viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    // document.querySelector('#page-middle').style.width = "100%";
    // document.querySelector('#page-all').style.width = "100%";
    chrome.storage.sync.get({
        desktop: [],
        mobile: []
    }, function (items) {

        var styles = '@media (max-width: 767px) {';

        for(var i = 0; i < items.mobile.length; i++){
            if(!items.mobile[i]){
                styles += `tr.cb-row > td:nth-child(${i+1}), th:nth-child(${i+1}) {display: none;}`;
            }
        }
        styles += `}@media (min-width: 767px) {`;

        for(var i = 0; i < items.desktop.length; i++){
            if(!items.desktop[i]){
                styles += `tr.cb-row > td:nth-child(${i+1}), th:nth-child(${i+1}) {display: none;}`;
            }
        }

        styles += "}";
        var styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

        console.log(styles);
    });
    checkFlag();
}


function checkFlag() {
    flag = document.querySelector("#sr > div > table > tbody") != null && document.querySelector("#sr > div > table > tbody").rows.length != 0 && document.querySelectorAll("#sr > div > table > thead > tr > th").length == 7;
    if (flag == false || waiting == true) {
        // console.log('checking...');
        window.setTimeout(checkFlag, 1000);
    } else {
        document.querySelector("#sr > div > table").classList.add('table-responsive-full');
        var rows = document.querySelector("#sr > div > table > tbody").rows
        var len = document.querySelector("#sr > div > table > tbody").rows.length
        var names = [];
        for (var i = 0; i < len; i++) {
            var element = rows[i]["cells"][4];
            var text = element.textContent;
            names.push(text);
        }
        multipleCalls(names);
        flag = false;
        window.setTimeout(checkFlag, 1000);
    }
}

function multipleCalls(names) {
    console.log('calling!');
    var uri = "https://utdrmp.herokuapp.com/api/rmp?";
    for (var name of names) {
        uri += "names=" + name + "&";
    }
    chrome.runtime.sendMessage(uri, data => process(data));
    console.log('done calling!');
    waiting = true;
}

function process(data) {
    var k = JSON.parse(data);
    console.log(k);
    insertColumn(4, 'RMP');
    insertColumn(5, 'GPA');
    for (var i = 0; i < k.length; i++) {
        var element = document.querySelector("#sr > div > table > tbody").rows[i]["cells"];
        let heading1 = document.createElement('a');
        console.log(k[i].rating);
        heading1.textContent = k[i].rating.replace("based on ", "(").replace(" ratings", ")");
        if (k[i].link == 'N/A') {
            heading1 = document.createElement('p');
            heading1.textContent = "0 (N/A)";
        } else {
            heading1.href = `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${k[i].link}`
        }

        let heading2 = document.createElement('a');
        if (k[i].avgGPA.includes("0 Records")) {
            heading2 = document.createElement('p');
        } else {
            heading2.href = `https://saitanayd.github.io/utd-grades/?prof=${k[i].name}`;
        }
        heading2.textContent = k[i].avgGPA.replace("with ", "(").replace(" students", ")").replace("0 Records Found", "0 (N/A)");

        element[4].append(heading1);
        element[5].append(heading2);
    }

    document.querySelectorAll('td:nth-child(2)').forEach(el => {
        el.textContent = el.textContent.replace("Semester Credit", " ");
    })
    waiting = false;
}

function insertColumn(index, name) {
    for (var k of document.querySelectorAll(`#sr div table tbody td:nth-child(${index})`)) {
        k.insertAdjacentElement('afterend', document.createElement('td'));
    }
    let heading = document.createElement('th');
    heading.onclick = function () { sort(index) };
    heading.textContent = name;
    document.querySelector(`#sr > div > table > thead > tr > th:nth-child(${index-1})`).insertAdjacentElement('afterend', heading);
}

getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

comparer = (idx, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
)(this.getCellValue(asc ? a : b, idx), this.getCellValue(asc ? b : a, idx));
var asc = true;
function sort(thid) {
    var th = document.querySelector(`#sr > div > table > thead > tr > th:nth-child(${thid + 1})`)
    const table = th.closest('table').querySelector('tbody');
    Array.from(table.querySelectorAll('tr:nth-child(n+1)'))
        .sort(this.comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
        .forEach(tr => table.appendChild(tr));
    var odd = false;
    for (var c of document.querySelector("#sr > div > table > tbody").rows) {
        if (odd) {
            c.classList.remove("odd");
            c.classList.add("even");
        } else {
            c.classList.add("odd");
            c.classList.remove("even");
        }
        odd = !odd;
    }
}

function show(id, block) {
    document.querySelectorAll(`td:nth-child(${id}), th:nth-child(${id})`).forEach(el => {
        el.style.display = block ? "table-cell" : "none";
    })
}

/* End coursebook enhancement */

function start() {
    fetch(chrome.extension.getURL("loading.html"))
        .then(response => response.text())
        .then(template => {
            document.getElementsByTagName("html")[0].innerHTML = template;
        });

    console.log("Fetching your unique id...")
    fetch(urlPrefix + "/webapps/blackboard/execute/personalInfo")
        .then(response => response.text())
        .then(result => getUserId(result))
        .catch(error => console.log("you're not logged in."));
}

// save user ID for API calls
function getUserId(result) {
    console.log(result);
    avatarid = result.match("key=(.*?), dataType=blackboard.data.user.User");
    var nameMatch = result.match("class=global-top-avatar />(.*?)<span");
    var avatarMatch = result.match('src="(/avatar/.*?user.*?)"');
    // src="/avatar/default_user?ts=1525262400000"  <- note: needs to also match this for default avatar

    console.log(avatarid);
    if (!avatarid || avatarid.length < 2) {
        console.log("Not logged in");
    } else {
        email = result.match("Email: (.*?@utdallas\\.edu)")[1];
        console.log(email);
        user_id = avatarid[1];
        username = nameMatch[1];
        avatar_link = avatarMatch[1];
        replacePage();
    }
}

// logic for choosing page to replace
function replacePage() {
    var href = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    var courseId = urlParams.get("course_id");
    var replaceUrl = "home";
    var contentId = "";
    var iframeSrc = "";
    var title = "";

    if (href.startsWith(urlPrefix + "/webapps/portal/execute/tabs/tabAction")) {
        replaceUrl = "home";
    } else if (href.startsWith(urlPrefix + "/webapps/blackboard/content/listContent")) {
        if (urlParams.get('content_id') != null) {
            replaceUrl = "content";
        } else {
            replaceUrl = "course";
        }
    } else if (href.startsWith(urlPrefix + "/webapps/blackboard/execute/announcement")) {
        replaceUrl = "announcement";
    } else if (href.startsWith(urlPrefix + "/webapps/calendar")) {
        iframeSrc = urlPrefix + "/webapps/calendar/viewMyBb?globalNavigation=false";
        title = "Calendar";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/assignment/uploadAssignment")) {
        iframeSrc = href;
        title = "Assignment";
        replaceUrl = "iframe";
    }/* else if (href.startsWith(urlPrefix+"/webapps/discussionboard")) {
        iframeSrc = href;
        title = "Discussion Board";
        replaceUrl = "iframe";
    }*/ else if (href.startsWith(urlPrefix + "/webapps/collab-ultra/tool/collabultra")) {
        iframeSrc = href;
        title = "BlackBoard Collab";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/assessment/take/launchAssessment")) {
        iframeSrc = href;
        title = "Assessment";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/bb-mygrades-BBLEARN")) {
        iframeSrc = href;
        title = "My Grades";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/gradebook")) {
        iframeSrc = href;
        title = "Gradebook";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/blackboard/content/contentWrapper")) {
        iframeSrc = href;
        title = "Content";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/discussionboard/")) {
        if (href.includes("conf_id") || href.includes("forum_id")) {
            iframeSrc = href;
            title = "Discussion";
            replaceUrl = "iframe";
        } else {
            replaceUrl = "discussion";
        }
    }
    else {
        // no suitable replacement found, use iframe fallback
        iframeSrc = href;
        title = "Blackboard";
        replaceUrl = "iframe";
    }

    if (courseId == null) courseId = "";

    fetch(chrome.extension.getURL("home/index.html"))
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
                iframe(template, iframeSrc, title, courseId);
            else if (replaceUrl === "discussion")
                discussion(template, courseId);
        })
        .catch(function (response) {
            // console.log(response.statusText);
        });
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

// loads html from storage, puts in email, render quick add calendar popup
function processTemplate(template, main) {
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

    return chrome.storage.local.get({ reads: [] }, function (result) {
        readAlready = result.reads;
        Array.from(document.querySelectorAll("a[data-dropdown='notificationMenu']")).forEach(function (a) {
            a.addEventListener('click', function (e) {
                e.preventDefault();

                var el = e.target;

                document.querySelector("body").prepend(createElementFromHTML('<div id="dropdownOverlay" style="background: transparent; height:100%;width:100%;position:fixed;"></div>'))

                var container = e.currentTarget.parentNode;
                var dropdown = document.querySelector('.dropdown');
                var containerWidth = container.offsetWidth
                var containerHeight = container.offsetHeight

                dropdown.style.right = containerWidth / 2 + 'px';

                if (container.classList.contains("expanded")) {
                    container.classList.remove("expanded");
                    readAllAnnouncements()

                } else {
                    container.classList.add("expanded")
                }
            })
            return checkLatestRelease().then(a => { return processNotifications() });
        })
    });


    // check latest versions

}

function readAllAnnouncements() {
    chrome.storage.local.get({ reads: [] }, function (result) {
        console.log(result);
        var newReads = result.reads;
        for (var anmt of allAnnouncements)
            if (!newReads.includes(anmt))
                newReads.push(anmt);
        console.log(newReads)
        newReads = newReads.slice(-50)
        readAlready = newReads
        allAnnouncements = []

        chrome.storage.local.set({
            reads: newReads
        }, function () {
            console.log("added read announcements");
            console.log(newReads);
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
    return fetch("https://api.github.com/repos/sunnyguan/whiteboard/releases/latest").then(d => d.json()).then(release => {
        var latestVersion = verToNumber(release["tag_name"].substring(1));
        return fetch("https://raw.githubusercontent.com/sunnyguan/whiteboard/master/whiteboard/manifest.json").then(data => data.json()).then(beta => {
            var betaVersion = verToNumber(beta["version"]);
            return fetch(chrome.extension.getURL("manifest.json")).then(data => data.json()).then(current => {
                var appVersion = verToNumber(current["version"])
                console.log("Latest: " + latestVersion);
                console.log("Current: " + appVersion);

                // testing
                // latestVersion = verToNumber("1.0.0");
                // betaVersion = verToNumber("1.0.7");
                // appVersion = verToNumber("1.0.5");

                if (appVersion < latestVersion) {
                    document.querySelector("#stableUpdate").innerText = "Major Update Available!";
                    document.querySelector("#stableUpdate").href = release.assets[0].browser_download_url;
                    document.querySelector("#stableUpdate").style.color = "rgb(255, 78, 103)";
                    document.querySelector("#stableUpdate").style.borderColor = "rgba(255,3,3,70%)";
                } else if (appVersion < betaVersion) {
                    document.querySelector("#stableUpdate").innerText = "Beta Available!";
                    document.querySelector("#stableUpdate").href = "https://github.com/sunnyguan/whiteboard/raw/master/whiteboard.zip";
                    // document.querySelector("#stableUpdate").style.color = "rgb(78, 255, 103)";
                    // document.querySelector("#stableUpdate").style.borderColor = "rgba(3,255,3,70%)";
                    document.querySelector("#stableUpdate").style.color = "rgb(144, 255, 101, 0.7)";
                    document.querySelector("#stableUpdate").style.borderColor = "rgb(144, 255, 101, 0.7)";
                } else if (appVersion > betaVersion) {
                    // easter egg : )
                    document.querySelector("#stableUpdate").innerText = "Developer Mode";
                    document.querySelector("#stableUpdate").style.borderImage = "linear-gradient(to right bottom, rgb(184, 39, 252) 0%, rgb(44, 144, 252) 25%, rgb(184, 253, 51) 50%, rgb(254, 200, 55) 75%, rgb(253, 24, 146) 100%) 1 / 1 / 0 stretch";
                    document.querySelector("#stableUpdate").style.borderImageSlice = "1";
                    document.querySelector("#stableUpdate").style.color = "yellow";
                } else {
                    document.querySelector("#stableUpdate").innerText = "On Latest Version";
                    document.querySelector("#stableUpdate").style.color = "rgb(0, 78, 103)";
                    document.querySelector("#stableUpdate").style.borderColor = "initial";
                }
                refreshNavLinks();
                render_calendar_addon();
            })
        })
    });
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

    return fetch(urlPrefix + "/learn/api/public/v1/calendars/items?since=" + lastSunday + "&until=" + nextSunday).then(response => response.json()).then(data => {
        if ("results" in data) {
            // console.log(data);
            for (var cls of data["results"]) {
                var name = cls.title;
                var course = cls.calendarName.split(".")[0];
                var color = cls.color;
                var id = cls.id;
                var dateStart = cls.start.split("T")[0];
                var jsDate = new Date(cls.end);
                jsDate.setTime(jsDate.getTime() - 5 * 60 * 60 * 1000);
                var dist = jsDate.getDay();
                if (jsDate.getTime() > lastSun.getTime() && jsDate.getTime() < nextSun.getTime()) {
                    var processName = name;
                    if (processName.length > 15) {
                        processName = processName.substring(0, 18) + "...";
                    }
                    var newElement = createElementFromHTML(`
                        <p class="zoomText employee design box" style="background-color: ${color}; font-size: 12px;">
                            <a class="directLink" style="white-space: pre; text-decoration: none; color: white; cursor: inherit; width: 100%; height: 100%" 
                                href=urlPrefix+"/webapps/calendar/launch/attempt/_blackboard.platform.gradebook2.GradableItem-${id}">${processName + "\n" + course}</a>
                        </p>
                    `);
                    if ("dynamicCalendarItemProps" in cls) {
                        newElement.style.cursor = "pointer";
                    } else {
                        newElement.style.cursor = "initial";
                        newElement.querySelector(".directLink").addEventListener('click', function (e) { e.preventDefault(); });
                        newElement.querySelector(".directLink").href = "";
                    }
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
                // console.log(data);
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

var home_main = `
    <div class="mdl-grid demo-content">
        <div id="announcementDiv"
          class="demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
          <div id="announcementLoad" style="width: 100%; text-align: center;">
            Loading Announcements...
          </div>
        </div>
        <div class="demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid"
          style="padding: 15px">
          <div class="container">
            <header>
              <h3 style="font-family: Roboto; font-weight: 300;">Week at a Glance</h2>
            </header>
            <div class="grid-calendar" style="margin: auto;">
            </div>
            <div class="grid-calendar" style="margin: auto;">
              <div class="row calendar-week" id="agenda-container">
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div>
                      <p class="employee design">Sunday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div>
                      <p class="employee design">Monday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div>
                      <p class="employee design">Tuesday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div>
                      <p class="employee design">Wednesday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div>
                      <p class="employee design">Thursday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div>
                      <p class="employee design">Friday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div>
                      <p class="employee design">Saturday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="gradeAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
          <div class="mdl-shadow--4dp mdl-cell mdl-cell--12-col dashboard" style="cursor: auto !important;">
            <div class="status success"></div>
            <div class="detail">
              <div class="mdl-grid">
                <div class="mdl-cell mdl-cell--4-col block" style="color: black;">
                  <div style="text-align: left;">
                    <h3 style="font-weight: 300;">Course Name</h3>
                    <h5 style="font-weight: 100; margin: 0 0 0 2px;">Last Updated</h5>
                  </div>
                </div>
                <div class="mdl-cell mdl-cell--6-col block" style="margin: 2px 0px 0px 8px;">
                  <div style="margin: auto;float: right; display:table; height:100%;">
                    <h4
                      style="font-weight: 100; margin: 0; display: table-cell; vertical-align: middle; color: black !important;">
                      Latest Grade</h4>
                  </div>
                </div>
                <div class="mdl-cell mdl-cell--2-col block" style="margin: 2px 0px 0px 8px; display: flex;">
                  <div style="margin: auto;float: right;">
                    <h4 style="font-weight: 100; margin: 0; color: black !important;">Overall (%)</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="courseAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid"></div>
        <div class="groupAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
            <h3 style="font-weight: 200;width: 100%;text-align: center;">Group support coming soon!</h3>
        </div>
    </div>
`;

// dashboard page (home)
function home(template) {
    console.log(user_id);
    fetch(urlPrefix + "/learn/api/public/v1/users/" + user_id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
        processTemplate(template, home_main);
        var bbScrape = document.createElement("iframe");
        bbScrape.id = "bbFrame";
        bbScrape.style.display = 'none';
        bbScrape.src = urlPrefix + "/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1";
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
                    <div class="mdl-card__title mdl-card--expand mdl-color--cyan-100">
                        <h2 class="courseTitle mdl-card__title-text">${course.course.name}</h2>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href=urlPrefix+"/webapps/blackboard/content/listContent.jsp?course_id=${course.course.id}" class="float-left courseLink1 mdl-button mdl-js-button mdl-js-ripple-effect">Homepage</a>
                        <a href=urlPrefix+"/webapps/blackboard/execute/announcement?course_id=${course.course.id}" class="float-right courseLink2 mdl-button mdl-js-button mdl-js-ripple-effect">Announcements</a>
                    </div>
                </div>`
            );
            // newElement.querySelector(".courseContent").textContent = "Course content goes here"; // what to put here?
            document.querySelector(".courseAll").appendChild(newElement);
        }
        // add the other stuff at the bottom
        // TODO: work on groups
        /* for (var course of courseArr) {
            // NOTE: this could break if the 2208 pattern changes!
            if (course.course.courseId.startsWith('2208-')) continue;

            var newElement = createElementFromHTML(
                `<div class="zoomDiv group demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--4-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--blue-300">
                        <h2 class="groupTitle mdl-card__title-text">${course.course.name}</h2>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href=urlPrefix+"/webapps/blackboard/content/listContent.jsp?course_id=${course.course.id}" class="groupLink mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>
                    </div>
                </div>`
            );
            // newElement.querySelector(".groupContent").textContent = "Course content goes here"; // what to put here?
            document.querySelector(".groupAll").appendChild(newElement);
        }*/

        return fetchSidebarCourses().then(data => { return fetchGrades().then(text => { return processAgenda().then(ss => { return loadAnnouncementCards() }) }) });
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

    return fetchRetry("https://elearning.utdallas.edu/webapps/streamViewer/streamViewer", 100, 5, head)
}

function wait(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}

function fetchRetry(url, delay, tries, fetchOptions = {}) {
    function onError(err) {
        triesLeft = tries - 1;
        if (!triesLeft) {
            console.log("error while fetching announcements");
        }
        console.log("tries left: " + triesLeft);
        return wait(delay).then(() => fetchRetry(url, delay, triesLeft, fetchOptions));
    }
    return fetch(url, fetchOptions).then(resp => resp.json()).then(a => {
        if (a["sv_streamEntries"].length == 0)
            onError(null);
        else
            processRankedNotifications(a)
    });
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

var allAnnouncements = [];
var readAlready = [];

function processRankedNotifications(res) {
    var updates = res["sv_streamEntries"];
    updates.sort((a, b) => (a.se_timestamp > b.se_timestamp) ? -1 : ((b.se_timestamp > a.se_timestamp) ? 1 : 0));
    updates = updates.slice(0, 20);
    console.log(updates);

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
                <span class="from"><a href="#">${courseName}</a></span>
                <span class="date">${time} ago</span>
                </div>
            </li>
        `)
        appElement.appendChild(element);
        console.log(update.se_context);
    }

    if (unreadCount !== 0) {
        document.querySelector(".circle").textContent = unreadCount;
        document.querySelector(".circle").style.backgroundColor = "red";
    }

    document.querySelector("#announcementsCount").textContent = anmtCount;
    document.querySelector("#messagesCount").textContent = msgCount;
}

function gradeToColor(grade, def, convert = false) {
    var colorClass = def;
    if (grade === "N/A")
        return def;

    var checkLetter = grade.trim();
    var matches = checkLetter.match("([A-Z])\+");
    if (matches) {
        var cat = matches[0];
        if (cat === 'A') colorClass = def;
        else if (cat === 'B') colorClass = "success2";
        else colorClass = "success3";
        return { "grade": grade, "color": colorClass };
    }

    try {
        var evaluated = eval(grade);
        evaluated = Math.round((evaluated + Number.EPSILON) * 10000) / 10000
        var newGrade = evaluated * 100;
        if (newGrade < 80)
            colorClass = "success3";
        else if (newGrade < 90)
            colorClass = "success2";
        if (convert) grade = newGrade;
    } catch (err) { }
    return { "grade": grade, "color": colorClass };
}

function fetchGrades() {
    // console.log(courseIds);
    var promises = [];
    for (var courseId in courseIds) {
        promises.push(`${urlPrefix}/webapps/bb-mygrades-BBLEARN/myGrades?course_id=${courseId}&stream_name=mygrades&is_stream=false`);
    }

    return Promise.all(promises.map(url => fetch(url).then(resp => resp.text()).then(res => {
        var doc = new DOMParser().parseFromString(res, "text/html");
        var script = doc.createElement("script");
        script.text = "mygrades.sort('sortByLastActivity', true)";
        doc.head.appendChild(script).parentNode.removeChild(script);

        var overallRows = doc.querySelector(".calculatedRow > .cell.grade");
        var courseId = url.split("?course_id=")[1].split("&")[0];
        var grade = "N/A";
        var colorClassOverall = "success";
        if (overallRows && overallRows.textContent.trim() !== "-") {
            grade = overallRows.textContent.trim();
        }
        if (grade !== "N/A") {
            var converted = gradeToColor(grade, "success", true);
            colorClassOverall = converted["color"];
            grade = converted["grade"];
        }

        var lastGradeRow = doc.querySelector(".graded_item_row");
        var lastGradeElement = doc.querySelector(".graded_item_row > div.cell.grade");
        var lastGrade = "N/A";
        var lastHW = "N/A";
        var lastGradeColor = "success";
        var date = "No date information.";
        if (lastGradeElement) {
            lastGrade = lastGradeElement.textContent.trim();
            var convertedLast = gradeToColor(lastGrade, "success");
            lastGradeColor = convertedLast["color"];
            lastGrade = convertedLast["grade"];
            var dateElement = lastGradeRow.querySelector("div.cell.activity.timestamp > span.lastActivityDate");
            if (dateElement) {
                date = dateElement.textContent;
            }
            lastHW = lastGradeRow.querySelector("div.cell.gradable > a").textContent.trim();
            if (lastHW.length > 35) lastHW = lastHW.substring(0, 35) + "...";
        }

        if (lastGrade !== "N/A" || grade !== "N/A") {
            var newElement = createElementFromHTML(
                `<div class="zoomDiv mdl-shadow--4dp mdl-cell mdl-cell--12-col dashboard" onclick="location.href='${url}'">
                    <div class="status success"></div>
                    <div class="detail">
                        <div class="mdl-grid">
                            <div class="mdl-cell mdl-cell--4-col block" style="color: black;">
                                <div style="text-align: left;">
                                    <h3 style="font-weight: 100;">${courseIds[courseId]}</h3>
                                    <h5 style="font-weight: 100; margin: 0 0 0 2px;">${date}</h5>
                                </div>
                            </div>
                            <div class="mdl-cell mdl-cell--6-col block ${lastGradeColor}" style="margin: 2px 0px 0px 8px; display: flex;">
                                <div style="margin: auto;float: right; width: 100%;">
                                    <h4 style="font-weight: 100; margin: 0;">${lastHW}</h4>
                                    <h4 style="font-weight: 100; margin: 0;">${lastGrade}</h4>
                                </div>
                            </div>
                            <div class="mdl-cell mdl-cell--2-col block ${colorClassOverall} overall" style="margin: 2px 0px 0px 8px;">
                                <div style="margin: auto;float: right;">
                                    <h4 style="font-weight: 100; margin: 0;">${grade}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
            );
            document.querySelector(".gradeAll").appendChild(newElement);
        }
    })));
}

// load the top announcement card sliders
function loadAnnouncementCards() {
    if (courseIds.length == 0)
        return;

    var announcement_fetches = [];
    var announcements = document.getElementById("announcementDiv");
    for (var courseId of Object.keys(courseIds)) {
        announcement_fetches.push(urlPrefix + "/learn/api/public/v1/courses/" + courseId + "/announcements?sort=modified(desc)");
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
                <div class="mdl-card__title mdl-card--expand mdl-color--cyan-100" 
                    style="background-color: orange !important; background: none; min-height: 120px;"
                    onclick="location.href='${urlPrefix}/webapps/blackboard/execute/announcement?course_id=${courseId}'">
                    <div style="position: absolute; right: 0; top: 0; font-weight: 300; font-family: Roboto; font-size: 14px; margin: 8px;">
                        ${(createdDate.getMonth() + 1) + "/" + createdDate.getDate()}
                    </div>
                    <h2 class="mdl-card__title-text" style="font-size: 20px; max-height: 88px; overflow-y: auto">${card1info.title}</h2>
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
                    <div class="mdl-card__title mdl-card--expand mdl-color--cyan-100" 
                        style="background-color: orange !important; background: none; min-height: 120px;"
                        onclick="location.href='${urlPrefix}/webapps/blackboard/execute/announcement?course_id=${courseId}'">
                        <div style="position: absolute; right: 0; top: 0; font-weight: 300; font-family: Roboto; font-size: 14px; margin: 8px;">
                            ${(createdDate.getMonth() + 1) + "/" + createdDate.getDate()}
                        </div>
                        <h2 class="mdl-card__title-text" style="font-size: 20px; max-height: 88px; overflow-y: auto">${card2info.title}</h2>
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

var course_main = `
    <div class="mdl-grid demo-content">
        <div class="contents demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        </div>
    </div>
`;

// load course contents
function course(template, courseId) {
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
                console.log(t);
                addToLinks(t.getAttribute("href"), t.getAttribute("courseid"), t.getAttribute("title"));
            });

            allLinks.appendChild(newElement);
        }
        return fetchSidebarCourses(courseId);
    })
}

var content_main = `
    <div class="mdl-grid demo-content">
        <div class="informationAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        </div>
    </div>
`;

// load a content (can mean a lot of things! almost everything that is a "page" is a content)
function content(template, courseId, contentId) {
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
                    console.log(t);
                    addToLinks(t);
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

// add link to pinned
function addToLinks(element) {
    var link = element.getAttribute("href");
    var courseId = element.getAttribute("courseid");
    var name = element.getAttribute("title");

    chrome.storage.local.get({ links: {} }, function (result) {
        console.log(result);
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
            console.log(newlinks);
            if (add_new) {
                var newLink = createElementFromHTML(`
                    <li>
                        <div class="mdl-navigation__link">
                            <i class="mdl-color-text--blue-grey-400 material-icons pin" 
                                style="padding: 0; color: red !important; cursor: pointer; transform: rotate(-90deg);" 
                                href="${link}" courseid="${courseId}" title="${name}">
                                    push_pin
                            </i>
                            <a href="${link}" class="no-dec-link">
                                ${name}
                            </a>
                        </div>
                    </li>
                `);
                newLink.querySelector(".pin").addEventListener('click', function (event) {
                    var t = event.target;
                    removeFromLinks(t);
                });
                document.querySelector(`li[course="${courseId}"] > ul`).prepend(newLink);
            }
        });
    });
}

// remove link from pinned
function removeFromLinks(element) {
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
        console.log(newlinks[courseId]);
        console.log({ link: link, title: name });
        chrome.storage.local.set({
            links: newlinks
        }, function () {
            console.log("link removed");
            console.log(newlinks);
            element.parentNode.parentNode.parentNode.removeChild(element.parentNode.parentNode);
        });
    });
}

// fetch list of courses for sidebar (home page and iframe)
function fetchSidebarCourses(courseId = "") {
    return fetchCourseList().then(courses => {
        var allLinks = document.querySelector('.allLinks');
        var currentCourse;
        uiCourses = courses;
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
                    removeFromLinks(t);
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
                                <li>
                                    <a href="${a.href}" class="mdl-navigation__link no-dec-link">
                                        <i class="material-icons" role="presentation">assistant</i>
                                        ${a.textContent}
                                    </a>
                                </li>
                            `);
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

var courseIds = {};

// fetch list of courses
function fetchCourseList() {
    return fetch(urlPrefix + "/learn/api/public/v1/users/" + user_id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
        var courseArr = data.results;
        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });
        return new Promise(function (resolve, reject) {
            chrome.storage.local.get({ links: {} }, function (result) {
                var courses = [];
                for (var c of courseArr) {
                    // NOTE: this could break if the 2208 pattern changes!
                    // TODO find better way to separate course/group
                    // console.log(c.course.availability);
                    // console.log(c.course.name);
                    if (!c.course.courseId.startsWith('2208-') || c.course.availability.available === "No")
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
                }
                resolve(courses);
            });
        });
    });
}

var announcement_main = `
    <div class="mdl-grid demo-content">
        <div class="informationAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        </div>
    </div>
`;

// announcement page (very similar to content, might improve later)
function announcement(template, courseId) {
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

var iframe_main = `
    <iframe id="iframe" src="" style="width: 100%; height: 100%">
`;

// fallback to links not implemented
function iframe(template, iframeSrc, title, courseId) {
    processTemplate(template, iframe_main);
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


var discussion_main = `
    <div class="mdl-grid demo-content">
        <div class="informationAll demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        </div>
    </div>
`;

function discussion(template, courseId) {
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
        fetchSidebarCourses(courseId);
    })
}