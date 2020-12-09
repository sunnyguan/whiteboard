import { urlPrefix, email, user_id, username, avatar_link, courseIds, processTemplate, createElementFromHTML, fetchSidebarCourses, formatDate } from './utils.js';

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
                                href="${urlPrefix}/webapps/calendar/launch/attempt/_blackboard.platform.gradebook2.GradableItem-${id}">${processName + "\n" + course}</a>
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
          <div class="container" style="width: 100%">
            <header>
              <h3 style="font-family: Roboto; font-weight: 300;">Week at a Glance</h2>
            </header>
            <div class="grid-calendar" style="margin: auto;">
            </div>
            <div class="grid-calendar" style="margin: auto; width: 100%">
              <div class="row calendar-week" id="agenda-container">
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

// dashboard page (home)
export default async function home(template) {
  console.log(user_id);
  await fetch(urlPrefix + "/learn/api/public/v1/users/" + user_id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
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
                        <a href="${urlPrefix}/webapps/blackboard/content/listContent.jsp?course_id=${course.course.id}" class="float-left courseLink1 mdl-button mdl-js-button mdl-js-ripple-effect">Homepage</a>
                        <a href="${urlPrefix}/webapps/blackboard/execute/announcement?course_id=${course.course.id}" class="float-right courseLink2 mdl-button mdl-js-button mdl-js-ripple-effect">Announcements</a>
                    </div>
                </div>`
      );
      // newElement.querySelector(".courseContent").textContent = "Course content goes here"; // what to put here?
      document.querySelector(".courseAll").appendChild(newElement);
    }
    // add the other stuff at the bottom
    // TODO: work on groups
    for (var course of courseArr) {
      // NOTE: this could break if the 2208 pattern changes!
      if (course.course.courseId.startsWith('2208-')) continue;
      var c = course;
      var unavailable = c.course.availability.available === "No";
      var f20 = c.course.courseId.startsWith('2208-');
      var s21 = c.course.courseId.startsWith('2212-');
      var group = c.dataSourceId === "_2_1";
      if (!(group))
        continue;
      var newElement = createElementFromHTML(
        `<div class="zoomDiv group demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet mdl-cell--4-col-desktop">
                    <div class="mdl-card__title mdl-card--expand mdl-color--blue-300">
                        <h2 class="groupTitle mdl-card__title-text">${course.course.name}</h2>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <a href="${urlPrefix}/webapps/blackboard/content/listContent.jsp?course_id=${course.course.id}" class="groupLink mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>
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
  // console.log(courseIds);
  var promises = [];
  console.log(courseIds);
  for (var courseId in courseIds) {

    // logic for removing group from grades (TODO: add option in menu)
    if(!courseIds[courseId].match("[A-Z]+ [0-9].[0-9]{2}\.")) continue;
    
    promises.push(`${urlPrefix}/webapps/bb-mygrades-BBLEARN/myGrades?course_id=${courseId}&stream_name=mygrades&is_stream=false`);
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
          if(!isNaN(createdDate.getTime()))
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

        return {"timestamp": timestamp, "element": newElement};
  }))).then(allCards => {
    allCards.sort((a, b) => {
      return b.timestamp - a.timestamp;
    })
    console.log(allCards);

    for(var card of allCards) {
      if(card) {
        announcements.appendChild(card.element);
        window.getComputedStyle(card.element).opacity; // added animation
        card.element.className += ' in';
      }
    }
  });
}