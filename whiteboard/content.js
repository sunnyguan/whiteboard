console.log('Blackboard extension loaded!');

chrome.extension.getURL("topbar.html")

newHTML = `<html>
  <head>
    <title>A Simple HTML Document</title>
  </head>
  <body>
    <p>This is a very simple HTML document</p>
    <p>It only has two paragraphs</p>
  </body>
</html>`
console.log(chrome.extension.getURL("home/index.html"))

fetch(chrome.extension.getURL("home/index.html"))
    .then(function (response) {
        switch (response.status) {
            // status "OK"
            case 200:
                return response.text();
            // status "Not Found"
            case 404:
                throw response;
        }
    })
    .then(function (template) {
        document.open()
        document.write(template)
        document.close()
        fetch("https://elearning.utdallas.edu/learn/api/public/v1/users/_267278_1/courses").then(response => response.json()).then(data => {
            var res = "";
            var arr = []
            for (var line of data.results) {
                arr.push(fetch("https://elearning.utdallas.edu/learn/api/public/v1/courses/" + line.courseId)
                .then(response => response.json()));
            }
            Promise.all(arr).then(results => {
                for(var res of results){
                    var elements = document.querySelectorAll(".course");
                    var element = elements[elements.length - 1];
                    var newElement = null;
                    if(element.querySelector(".courseTitle").textContent == "Sample"){
                        newElement = element;
                    } else {
                        newElement = element.cloneNode(true);
                    }
                    newElement.querySelector(".courseTitle").textContent = res.name;
                    newElement.querySelector(".courseContent").textContent = "Course content goes here";
                    element.insertAdjacentElement("afterend", newElement);
                }
                
            })
        })
        
    })
    .catch(function (response) {
        console.log(response.statusText);
    });