console.log('Whiteboard extension loaded!');
console.log(chrome.extension.getURL("home/index.html"))
console.log("Fetching your unique id...")

var id = "";
var email = "";
fetch("https://elearning.utdallas.edu/webapps/blackboard/execute/personalInfo")
    .then(response => response.text())
    .then(result => getUserId(result))
    .catch(error => console.log('error', error));

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

    if(href.startsWith("https://elearning.utdallas.edu/webapps/portal/execute/tabs/tabAction")){
        replaceUrl = "home";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp")){
        courseId = href.split("jsp?courseId=")[1];
        replaceUrl = "course";
    }
    else {
        foundReplacement = false;
    }
    if(foundReplacement){
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
            if(replaceUrl === "home")
                home(template);
            else if(replaceUrl === "course")
                course(template, courseId);
        })
        .catch(function (response) {
            console.log(response.statusText);
        });
    }
}

function home(template) {
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/" + id + "/courses?availability.available=Yes&role=Student&expand=course").then(response => response.json()).then(data => {
        processTemplate(template);
        var res = "";
        var fetchArr = [];
        var courseArr = data.results;

        courseArr.sort(function(a, b) {
            return a.course.name > b.course.name ? 1 : a.course.name < b.course.name ? -1 : 0;
        });

        console.log('courseArr', courseArr)

        // add the "real" classes first
        for (var c of courseArr) {
            console.log(c);
            // NOTE: this could break if the 2208 pattern changes!
            if (!c.course.courseId.startsWith('2208-')) continue;

            console.log(c.course.courseid, c.course.name);
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
            newElement.querySelector(".courseLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + c.course.id;
            element.insertAdjacentElement("afterend", newElement);
        }
        // add the other stuff at the bottom
        for (var c of courseArr) {
            console.log(c);
            // NOTE: this could break if the 2208 pattern changes!
            if (c.course.courseId.startsWith('2208-')) continue;

            console.log(c.course.courseid, c.course.name);
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
            newElement.querySelector(".courseLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + c.course.id;
            element.insertAdjacentElement("afterend", newElement);
        }
    })
}

function course(template, courseId) {
    document.open()
    document.write(template)
    document.close()
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents").then(response => response.json()).then(data => {
        debugger
        for (var res of data["results"]) {
            var elements = document.querySelectorAll(".content");
            var element = elements[elements.length - 1];
            var newElement = null;
            if (element.querySelector(".contentTitle").textContent == "Sample") {
                newElement = element;
            } else {
                newElement = element.cloneNode(true);
            }
            newElement.querySelector(".contentTitle").textContent = res.title;
            newElement.querySelector(".contentContent").textContent = "Content details goes here";
            // newElement.querySelector(".contentLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?courseId=" + res.courseId;
            element.insertAdjacentElement("afterend", newElement);
        }
    })
}
