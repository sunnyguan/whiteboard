(async () => {
    const urlPrefix = "https://elearning.utdallas.edu";
    
    // logic to determine if we should activate whiteboard on this page
    chrome.storage.local.get(['enabled'], async function (result) {
        enabled = result.enabled !== false;
        console.log("Extension has been " + (enabled ? "en" : "dis") + "abled from the popup.");

        // only replace page if extension enabled and url starts with /webapps
        if (enabled) {
            if (window.location.href.startsWith(urlPrefix)) {
                await start();
            } else if (window.location.href.includes("coursebook.utdallas.edu")) {
                await startCoursebook();
            }
        }
    });
})(); 

console.log('Whiteboard extension loaded!');

async function startCoursebook() {
    const src = chrome.extension.getURL('js/coursebook.js');
    const contentScript = await import(src);
    contentScript.startCB();
}

async function start() {
    console.log('hi');
    var originalHTML = "Please turn off Whiteboard, log in normally, and turn on Whiteboard.";
    fetch(chrome.extension.getURL("loading.html"))
        .then(response => response.text())
        .then(template => {
            originalHTML = document.getElementsByTagName("html")[0].innerHTML;
            document.getElementsByTagName("html")[0].innerHTML = template;
        });

    const src = chrome.extension.getURL('js/main.js');
    const contentScript = await import(src);
    contentScript.start();
}