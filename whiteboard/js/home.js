import {
    courseIds,
    createElementFromHTML,
    fetchSidebarCourses,
    formatDate,
    options,
    processTemplate,
    urlPrefix,
    user_id
} from './utils.js';

let numWeeks = 0;

// fetch week at a glance
function processAgenda() {
    const curDate = new Date();
    curDate.setDate(curDate.getDate() + numWeeks * 7);
    const lastSun = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() - curDate.getDay());
    const midSun = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() - curDate.getDay() + 7);
    const nextSun = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate() - curDate.getDay() + 14);

    document.querySelector("#agenda-container1 > div:nth-child(1) > div > div > p:nth-child(1)").textContent = "Sunday (" + (1 + lastSun.getMonth()) + "/" + lastSun.getDate() + ")";
    document.querySelector("#agenda-container2 > div:nth-child(1) > div > div > p:nth-child(1)").textContent = "Sunday (" + (1 + midSun.getMonth()) + "/" + midSun.getDate() + ")";

    document.querySelectorAll('.employee-wrapper').forEach(day => {
        while (day.childElementCount > 1) {
            day.removeChild(day.lastChild);
        }
    })

    return fetch(`${urlPrefix}/learn/api/public/v1/calendars/items?since=${formatDate(lastSun)}&until=${formatDate(nextSun)}`).then(response => response.json()).then(data => {
        if ("results" in data) {
            for (let cls of data["results"]) {
                /**
                 * Example cls:
                 * {
                 *      "id": "_1749031_1",
                 *      "type": "GradebookColumn",
                 *      "calendarId": "_263543_1",
                 *      "calendarName": "2228-UTDAL-CS-6363-SEC001-84728: CS 6363.001 - Design and Analysis of Computer Algorithms - F22",
                 *      "title": "Homework 2",
                 *      "start": "2022-09-22T04:59:00.000Z",
                 *      "end": "2022-09-22T04:59:00.000Z",
                 *      "modified": null,
                 *      "color": "#222222",
                 *      "disableResizing": true,
                 *      "createdByUserId": null,
                 *      "dynamicCalendarItemProps": {
                 *          "attemptable": true,
                 *          "categoryId": "_2273721_1",
                 *          "dateRangeLimited": false,
                 *          "eventType": "Assignment",
                 *          "gradable": false
                 *      }
                 *  }
                 */
                const dueDate = new Date(cls.end);
                if (dueDate.getTime() < lastSun.getTime() || dueDate.getTime() > nextSun.getTime()) { continue; }
                
                const day = dueDate.getDay();
                const week = Math.floor((dueDate.getTime() - lastSun.getTime()) / (7 * 24 * 60 * 60 * 1000));
                const name = cls.title.length > 15 ? cls.title.substring(0, 18) + "..." : cls.title;
                const course = cls.calendarName.split(": ")[1].split(".")[0];
                const color = cls.color;
                const id = cls.id;
                let newElement = createElementFromHTML(`
                    <p class="zoomText employee design box" style="background-color: ${color}; font-size: 12px;">
                        <a class="directLink" style="white-space: pre; text-decoration: none; color: white; cursor: inherit; width: 100%; height: 100%; display: block" 
                            href="${urlPrefix}/webapps/calendar/launch/attempt/_blackboard.platform.gradebook2.GradableItem-${id}">${name + "\n" + course}</a>
                    </p>
                `);
                if ("dynamicCalendarItemProps" in cls) {
                    newElement.style.cursor = "pointer";
                } else {
                    newElement.style.cursor = "initial";
                    newElement.querySelector(".directLink").addEventListener('click', function (e) { e.preventDefault(); });
                    newElement.querySelector(".directLink").href = "";
                }
                document.getElementsByClassName("calendar-week")[week].children[day].querySelector(".employee").insertAdjacentElement("afterend", newElement);
                window.getComputedStyle(newElement).opacity; // added
                newElement.className += ' in';
            }
        }
        // Highlight current day
        document.getElementsByClassName("calendar-week")[0].children[new Date().getDay()].querySelector(".day > div").style.backgroundColor = "";
        document.getElementsByClassName("calendar-week")[1].children[new Date().getDay()].querySelector(".day > div").style.backgroundColor = "";
        if (numWeeks === 0) {
            document.getElementsByClassName("calendar-week")[0].children[new Date().getDay()].querySelector(".day > div").style.backgroundColor = "#dfdfdf";
        } else if (numWeeks === -1) {
            document.getElementsByClassName("calendar-week")[1].children[new Date().getDay()].querySelector(".day > div").style.backgroundColor = "#dfdfdf";
        }
    })

}

var home_main = `
    <div class="mdl-grid demo-content">
        <div id="zuckjs">
            <div id="stories" class="storiesWrapper stories user-icon carousel snapgram">
            </div>
        </div>
        <div id="announcementDiv"
          class="demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
          <div id="announcementLoad" style="width: 100%; text-align: center;">
            Loading Announcements...
          </div>
        </div>
        <div class="demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid"
          style="padding: 15px">
          <div class="container" style="width: 100%">
          <header style="
              display: flex;
          ">
            <h3 style="font-family: Roboto;font-weight: 300;flex-grow: 1;">Two-Week Summary</h3><div style="
                display: flex;
                margin-top: auto;
                margin-bottom: auto;
            ">
            <div
            class="mdl-shadow--4dp"
            style="
                font-family: Muli, Arial, sans-serif;
                width: 100px;
                height: 50px;
                text-align: center;
                display: flex;
                justify-content: space-around;
                align-items: center;
                background: #3877ff;
                border-radius: 10px;
                position: relative;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left icon i-1 prev-next" id="calendar-prev">
              <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right icon i-2 prev-next" id="calendar-next">
              <polyline points="9 18 15 12 9 6"></polyline></svg>
              </svg>
            </div>
          </header>
            
            <div class="grid-calendar" style="margin: auto;">
            </div>
            <div class="grid-calendar" style="margin: auto; width: 100%">
              <div class="row calendar-week agenda-container" id="agenda-container1">
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Sunday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Monday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Tuesday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Wednesday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Thursday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Friday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Saturday</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row calendar-week agenda-container" id="agenda-container2">
              <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Sunday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Monday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Tuesday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Wednesday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Thursday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
                      <p class="employee design">Friday</p>
                    </div>
                  </div>
                </div>
                <div class="col-xs-1 grid-cell">
                  <div class="day">
                    <div class="employee-wrapper">
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
            <h3 style="font-weight: 200;width: 100%;text-align: center;"></h3>
        </div>
    </div>
`;

function addCSS(pre, filenames) {
    for (var filename of filenames) {
        var link = document.createElement("link");
        link.href = chrome.runtime.getURL(pre + "/" + filename);
        link.type = "text/css";
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);
    }
}

var timestamp = function () {
    var timeIndex = 0;
    var shifts = [35, 60, 60 * 3, 60 * 60 * 2, 60 * 60 * 25, 60 * 60 * 24 * 4, 60 * 60 * 24 * 10];

    var now = new Date();
    var shift = shifts[timeIndex++] || 0;
    var date = new Date(now - shift * 1000);

    return date.getTime() / 1000;
};

var changeSkin = function (skin) {
    location.href = location.href.split('#')[0].split('?')[0] + '?skin=' + skin;
};

var getCurrentSkin = function () {
    var header = document.getElementById('header');
    var skin = location.href.split('skin=')[1];

    if (!skin) {
        skin = 'Snapgram';
    }

    if (skin.indexOf('#') !== -1) {
        skin = skin.split('#')[0];
    }

    var skins = {
        Snapgram: {
            avatars: true,
            list: false,
            autoFullScreen: false,
            cubeEffect: true,
            paginationArrows: false
        },

        VemDeZAP: {
            avatars: false,
            list: true,
            autoFullScreen: false,
            cubeEffect: false,
            paginationArrows: true
        },

        FaceSnap: {
            avatars: true,
            list: false,
            autoFullScreen: true,
            cubeEffect: false,
            paginationArrows: true
        },

        Snapssenger: {
            avatars: false,
            list: false,
            autoFullScreen: false,
            cubeEffect: false,
            paginationArrows: false
        }
    };

    var el = document.querySelectorAll('#skin option');
    var total = el.length;
    for (var i = 0; i < total; i++) {
        var what = skin == el[i].value ? true : false;

        if (what) {
            el[i].setAttribute('selected', 'selected');

            header.innerHTML = skin;
            header.className = skin;
        } else {
            el[i].removeAttribute('selected');
        }
    }

    return {
        name: skin,
        params: skins[skin]
    };
};


function loadZuck() {
    fetch(chrome.runtime.getURL("zuck_js/zuck.min.js"))
        .then(resp => resp.text())
        .then(js => {
            eval(js);
            console.log('Zuck loaded!');
            runZuck();
        })
        .catch(console.error)
}

async function getStories() {
    var stories = await fetch("https://whiteboard-stories.herokuapp.com/stories")
        // var stories = await fetch("http://localhost:5000/stories")
        .then(resp => resp.text())
        .then(text => {
            return JSON.parse(text);
        });
    return stories;
}

const get = function (array, what) {
    if (array) {
        return array[what] || '';
    } else {
        return '';
    }
};

async function loadAddStory() {
    var addButton = createElementFromHTML(`
    <div class="story">
      <a class="item-link" target="_blank" rel="noopener noreferrer" href="https://whiteboard-stories.herokuapp.com/">
      <span class="item-preview">
        <img lazy="eager" src="https://www.pinclipart.com/picdir/big/1-17259_list-add-clip-art-add-image-button-png.png">
      </span>
      <span class="info" itemprop="author" itemscope="" itemtype="http://schema.org/Person">
        <strong class="name" itemprop="name">Add Story</strong>
        <span class="time"></span>
      </span>
      </a>
    </div>
  `);
    document.getElementById("stories").appendChild(addButton);
}

async function runZuck() {
    var currentSkin = getCurrentSkin();
    var json_stories = await getStories();
    var all_stories = json_stories;
    var stories = new Zuck('stories', {
        backNative: true,
        previousTap: true,
        reactive: false,
        skin: currentSkin['name'],
        autoFullScreen: currentSkin['params']['autoFullScreen'],
        avatars: currentSkin['params']['avatars'],
        paginationArrows: currentSkin['params']['paginationArrows'],
        list: currentSkin['params']['list'],
        cubeEffect: currentSkin['params']['cubeEffect'],
        localStorage: false,
        stories: all_stories,
        template: {
            viewerItemBody(index, currentIndex, item) {
                return `<div 
                        class="item ${get(item, 'seen') === true ? 'seen' : ''} ${currentIndex === index ? 'active' : ''}"
                        data-time="${get(item, 'time')}" data-type="${get(item, 'type')}" data-index="${index}" data-item-id="${get(item, 'id')}">
                        ${get(item, 'type') === 'photo'
                        ? `<img loading="auto" class="media" src="${get(item, 'src')}" ${get(item, 'type')}>${get(item, 'src')} />`
                        : `<h4 style="color: white; display: flex; text-align: center; align-items: center;" loading="auto" class="media" src="${get(item, 'src')}" ${get(item, 'type')}>${get(item, 'src')}</h4>
                        `}
                        ${get(item, 'link')
                        ? `<a class="tip link" href="${get(item, 'link')}" rel="noopener" target="_blank">
                                ${!get(item, 'linkText') || get(item, 'linkText') === '' ? "Visit Link" : get(item, 'linkText')}
                              </a>`
                        : ''
                    }
                      </div>`;
            }
        }
    });
    loadAddStory();
}

// dashboard page (home)
export default async function home(template) {
    processTemplate(template, home_main);
    if (options["loadStories"]) {
        addCSS("zuck_js", ["style.css", "zuck.min.css", "snapgram.css"]);
        loadZuck();
    }

    var bbScrape = document.createElement("iframe");
    bbScrape.id = "bbFrame";
    bbScrape.style.display = 'none';
    bbScrape.src = urlPrefix + "/webapps/portal/execute/tabs/tabAction?tab_tab_group_id=_1_1";
    document.getElementsByTagName("body")[0].appendChild(bbScrape);
    document.title = "Dashboard";

    document.querySelector("#calendar-next").onclick = function(e) {
        numWeeks++;
        processAgenda();
    }

    document.querySelector("#calendar-prev").onclick = function(e) {
        numWeeks--;
        processAgenda();
    }

    let now = new Date();
    fetch(urlPrefix + '/learn/api/v1/users/' + user_id + '/memberships?availability.available=Yes&role=Student&expand=course').then(res => res.json()).then(data => {
        let courseArr = data['results'];

        courseArr.sort(function (a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });

        const mergedCourses = [];
        // add the "real" classes first
        for (var c of courseArr) {
            if (!('term' in c['course']))
                continue
            if (new Date(c['course']['term']['startDate']) > now || now > new Date(c['course']['term']['endDate']))
                continue
            if (
                !options['showUnmerged'] &&
                mergedCourses.some(val => c.course.name.indexOf(val) != -1)
            )   continue;

            var newElement = createElementFromHTML(
                `<div class="zoomDiv course demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--6-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--cyan-100">
                        <h2 class="courseTitle mdl-card__title-text">${c.course.name}</h2>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href="${urlPrefix}/webapps/blackboard/content/listContent.jsp?course_id=${c.course.id}" class="float-left courseLink1 mdl-button mdl-js-button mdl-js-ripple-effect">Homepage</a>
                        <a href="${urlPrefix}/webapps/blackboard/execute/announcement?course_id=${c.course.id}" class="float-right courseLink2 mdl-button mdl-js-button mdl-js-ripple-effect">Announcements</a>
                    </div>
                </div>`
            );
            // newElement.querySelector(".courseContent").textContent = "Course content goes here"; // what to put here?
            document.querySelector(".courseAll").appendChild(newElement);

            // mark if this is a merged course. This logic blocks the unmerged courses from being seen
            if (c.course.name.startsWith('(MERGED) ')) {
                const matches = c.course.name.match(/[A-Z]{2,4} \d{4}\.\w{3}/g)
                if (matches)
                    matches.forEach(m => mergedCourses.push(m));
            }
        }
        // add the other stuff at the bottom
        // TODO: work on groups
        for (var c of courseArr) {
            // NOTE: this could break if the 2212 pattern changes!
            //var curSemester = c.course.courseId.startsWith('2228-');
            var group = c.course.organization === true;
            if (!group)
                continue;

            var newElement = createElementFromHTML(
                `<div class="zoomDiv group demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--4-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--blue-300">
                        <h2 class="groupTitle mdl-card__title-text">${c.course.name}</h2>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href="${urlPrefix}/webapps/blackboard/content/listContent.jsp?course_id=${c.course.id}" class="groupLink mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>
                    </div>
                </div>`
            );
            // newElement.querySelector(".groupContent").textContent = "Course content goes here"; // what to put here?
            document.querySelector(".groupAll").appendChild(newElement);
        }

        return fetchSidebarCourses().then(data => { return fetchGrades().then(text => { return processAgenda().then(ss => { return loadAnnouncementCards() }) }) });
    })
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
        newGrade = Math.round(newGrade * 100) / 100;
        if (newGrade < 80)
            colorClass = "success3";
        else if (newGrade < 90)
            colorClass = "success2";
        if (convert) grade = newGrade;
    } catch (err) { }
    return { "grade": grade, "color": colorClass };
}

function fetchGrades() {
    var promises = [];
    for (var courseId in courseIds) {

        // logic for removing group from grades (TODO: add option in menu)
        if (!options["showGroupGrades"]) {
            if (!courseIds[courseId].match("[A-Z]+ [0-9].[0-9]{2}\."))
                continue;
        }
		// https://elearning.utdallas.edu/webapps/bb-mygrades-BB6093de9f52e1b/myGrades?course_id=_195871_1&stream_name=mygrades&is_stream=false
        promises.push(`${urlPrefix}/webapps/bb-mygrades-BB6093de9f52e1b/myGrades?course_id=${courseId}&stream_name=mygrades&is_stream=false`);
    }

    return Promise.all(promises.map(url => fetch(url)
        .then(resp => resp.text())
        .then(res => {
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
                lastHW = lastGradeRow.querySelector("div.cell.gradable > a") ? lastGradeRow.querySelector("div.cell.gradable > a").textContent.trim() : "";
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
                // document.querySelector(".gradeAll").appendChild(newElement);
                var checkDate = new Date(date);
                var dateNumber = isNaN(checkDate) ? 0 : checkDate.getTime();
                return { "date": dateNumber, "element": newElement };
            }
        }))).then(arr => {
            arr.sort((t1, t2) => {
                return t2["date"] - t1["date"];
            })
            for (var obj of arr)
                if (obj && obj["element"])
                    document.querySelector(".gradeAll").appendChild(obj["element"]);
        });
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

    var announcementCards = [];

    return Promise.all(
        announcement_fetches.map(url =>
            fetch(url).then(resp => resp.json()).then(res => {
                if (!("results" in res && res["results"].length >= 1))
                    return;

                var card1info = res["results"][0];
                var courseId = url.split("courses/")[1].split("/")[0];
                var createdDate = new Date(card1info.created);
                var timestamp = 0;
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
                    if (!isNaN(createdDate.getTime()))
                        timestamp = createdDate.getTime() / 1000;
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

                return { "timestamp": timestamp, "element": newElement };
            }))).then(allCards => {
                allCards.sort((a, b) => {
                    return b.timestamp - a.timestamp;
                })

                for (var card of allCards) {
                    if (card) {
                        announcements.appendChild(card.element);
                        window.getComputedStyle(card.element).opacity; // added animation
                        card.element.className += ' in';
                    }
                }
            });
}