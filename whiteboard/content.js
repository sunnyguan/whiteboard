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
    var contentId = "";

    if(href.startsWith("https://elearning.utdallas.edu/webapps/portal/execute/tabs/tabAction")){
        replaceUrl = "home";
    } else if (href.startsWith("https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp")){
        
        if(href.includes("contentId")){
            var courseAndContent = href.split("jsp?courseId=")[1].split("&");
            courseId = courseAndContent[0];
            contentId = courseAndContent[1].split("=")[1];
            replaceUrl = "content";
        } else {
            courseId = href.split("jsp?courseId=")[1];
            replaceUrl = "course";
        }
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
            else if (replaceUrl === "content")
                content(template, courseId, contentId);
        })
        .catch(function (response) {
            console.log(response.statusText);
        });
    }
}

function processTemplate(template){
    document.open()
    document.write(template)
    document.close()
    var emailElement = document.getElementById("student-email");
    console.log(emailElement.innerText);
    emailElement.innerText = email;
}

function home(template) {
    processTemplate(template);
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/" + id + "/courses").then(response => response.json()).then(data => {
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
                newElement.querySelector(".courseLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?courseId=" + res.id;
                element.insertAdjacentElement("afterend", newElement);
            }

        })
    })

}

function course(template, courseId) {
    processTemplate(template);
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents").then(response => response.json()).then(data => {
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
            newElement.querySelector(".contentLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?courseId=" + courseId + "&contentId=" + res.id;
            element.insertAdjacentElement("afterend", newElement);
        }
    })
}

function content(template, courseId, contentId) {
    processTemplate(template);
    fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + courseId + "/contents/" + contentId + "/children").then(response => response.json()).then(data => {
        if("results" in data){
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
                // newElement.querySelector(".contentLink").href = "https://elearning.utdallas.edu/webapps/blackboard/content/listContent.jsp?courseId=" + res.courseId;
                element.insertAdjacentElement("afterend", newElement);
            }
        }
    })
}