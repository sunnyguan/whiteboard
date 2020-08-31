console.log('Blackboard extension loaded!');

var INTERVAL = 60; // in minutes

chrome.storage.sync.get({
    interval: 60,
	id: 0
}, function (result) {
    INTERVAL = result.interval;
	if (result.id != 0) {
		console.log("%cYour UTD ID: " + result.id, css);
	}
});

var css = "font-size: 40px";
cookies = document.cookie;
// console.log("Your cookies: " + cookies);

var myHeaders = new Headers();
myHeaders.append("Connection", "keep-alive");
myHeaders.append("DNT", "1");
myHeaders.append("Upgrade-Insecure-Requests", "1");
myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36 Edg/85.0.564.41");
myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
myHeaders.append("Sec-Fetch-Site", "none");
myHeaders.append("Sec-Fetch-Mode", "navigate");
myHeaders.append("Sec-Fetch-User", "?1");
myHeaders.append("Sec-Fetch-Dest", "document");
myHeaders.append("Accept-Language", "en-US,en;q=0.9");

var requestOptions = {};

if (cookies.includes("JSESSIONID")) {
    start_process();
} else {
    console.log("Not logged in");
}

function start_process() {
    myHeaders.append("Cookie", cookies);

    requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    chrome.storage.sync.get({
        lastSave: 0,
        id: 0
    }, function (items) {
        var diff = ((new Date().getTime() - items.lastSave)) / 1000.0 / 60;
        console.log("Time since last update: " + diff + " minutes");
        if (diff >= INTERVAL) {
            console.log("More than " + INTERVAL + " minutes, updating...");
            update();
        } else {
            console.log("Less than " + INTERVAL + " minutes, not updating.");
        }
    });
}

function update() {
    console.log("Fetching your unique id...")
    fetch("https://elearning.utdallas.edu/webapps/blackboard/execute/personalInfo", requestOptions)
        .then(response => response.text())
        .then(result => fetchCalendarLink(result))
        .catch(error => console.log('error', error));
}

function fetchCalendarLink(result) {
    avatarid = result.match("StudentId: (.*?)\\n");
    if(!avatarid || avatarid.length < 2){ // second logout check
        console.log("Not logged in");
    } else {
        avatarid = avatarid[1];
        console.log("%chttps://coolapis.herokuapp.com/ics?ptg=" + avatarid, css);
        fetch("https://elearning.utdallas.edu/webapps/calendar/calendarFeed/url", requestOptions)
            .then(response => response.text())
            .then(result => fetchCalendar(result))
            .catch(error => console.log('error', error));
    }
}

function fetchCalendar(data) {
    console.log("Original calendar url: " + data);
    fetch(data, requestOptions)
        .then(response => response.text())
        .then(result => process(result))
        .catch(error => console.log('error', error));
}

function process(data) {
    console.log("Calendar retrieved successfully.");
    var data = { ptg: avatarid, ics: data }
    fetch("https://coolapis.herokuapp.com/icsUpdate", {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => {
        chrome.storage.sync.set({
            lastSave: new Date().getTime(),
            id: avatarid
        }, function () {
            console.log("ICS updated on server, next update in " + INTERVAL + " minutes.");
        });
    });
}