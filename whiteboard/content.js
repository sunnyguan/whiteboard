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
        .catch(error => console.log('error', error));
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

    if (href.startsWith("https://elearning.utdallas.edu/webapps/portal/execute/tabs/tabAction")) {
        replaceUrl = "home";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp")) {
        if (href.includes("content_id")) {
            var courseAndContent = href.split("jsp?course_id=")[1].split("&");
            courseId = courseAndContent[0];
            contentId = courseAndContent[1].split("=")[1];
            replaceUrl = "content";
        } else {
            courseId = href.split("jsp?course_id=")[1];
            replaceUrl = "course";
        }
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/blackboard/execute/announcement")) {
        courseId = href.split("=")[1];
        replaceUrl = "announcement";
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
            })
            .catch(function (response) {
                console.log(response.statusText);
            });
    }
}

function processTemplate(template) {
    document.open()
    document.write(template)
    document.close()
    var emailElement = document.getElementById("student-email");
    console.log(emailElement.innerText);
    emailElement.innerText = email;
}

function home(template) {
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/" + id + "/courses").then(response => response.json()).then(data => {
        processTemplate(template);    
        var res = "";
        var arr = []
        for (var line of data.results) {
            arr.push(fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + line.courseId)
                .then(response => response.json()));
        }
        Promise.all(arr).then(results => {
            for (var res of results) {
                var elements = document.querySelectorAll(".course");
                var element = elements[elements.length - 1];
                var newElement = null;
                if (element.querySelector(".courseTitle").textContent == "Sample") {
                    newElement = element;
                } else {
                    newElement = element.cloneNode(true);
                }
                newElement.querySelector(".courseTitle").textContent = res.name;
                newElement.querySelector(".courseContent").textContent = "Course content goes here";
                newElement.querySelector(".courseLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + res.id;
                element.insertAdjacentElement("afterend", newElement);
            }

        })
    })

}

function course(template, courseId) {
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents").then(response => response.json()).then(data => {
        processTemplate(template);
        for (var res of data["results"]) {
            var elements = document.querySelectorAll(".content");
            var element = elements[elements.length - 1];
            var newElement = element.cloneNode(true); // change to null and switch comments on following if statements to remove announcements
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
    })
}

function content(template, courseId, contentId) {
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents/" + contentId + "/children").then(response => response.json()).then(data => {
        if ("results" in data) {
            processTemplate(template);
            for (var res of data["results"]) {
                var elements = document.querySelectorAll(".information");
                var element = elements[elements.length - 1];
                var newElement = null;
                if (element.querySelector(".informationTitle").textContent == "Sample") {
                    newElement = element;
                } else {
                    newElement = element.cloneNode(true);
                }
                newElement.querySelector(".informationTitle").textContent = res.title;
                newElement.querySelector(".informationContent").innerHTML = res.body;
                newElement.querySelector(".informationLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + res.id;
                element.insertAdjacentElement("afterend", newElement);
            }
            return false;
        } else {
            return true; // continue processing for single content (Home Work)
        }
    }).then(cont => {
        if(cont){
            fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents/" + contentId).then(response => response.json()).then(data => {
                processTemplate(template);
                if ("title" in data) {
                    var elements = document.querySelectorAll(".information");
                    var element = elements[elements.length - 1];
                    element.querySelector(".informationTitle").textContent = data.title;
                    element.querySelector(".informationContent").innerHTML = data.body;
                    // handle attachments
                    // element.querySelector(".informationLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + courseId + "&content_id=" + res.id;
                }
            })
        }
    })
}

function announcement(template, courseId) {
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/announcements").then(response => response.json()).then(data => {
        processTemplate(template);    
        if ("results" in data) {
            for (var res of data["results"]) {
                var elements = document.querySelectorAll(".information");
                var element = elements[elements.length - 1];
                var newElement = null;
                if (element.querySelector(".informationTitle").textContent == "Sample") {
                    newElement = element;
                } else {
                    newElement = element.cloneNode(true);
                }
                newElement.querySelector(".informationTitle").textContent = res.title;
                newElement.querySelector(".informationContent").innerHTML = res.body;
                // newElement.querySelector(".contentLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?course_id=" + res.courseId;
                element.insertAdjacentElement("afterend", newElement);
            }
        }
    })
}