(async () => {
    const urlPrefix = "https://elearning.utdallas.edu";
    // Do not run whiteboard if these denylist strings are present in the URI
    const denylist = [
        "elearning.utdallas.edu/auth-saml",
    ]
    var options = ['enabled', 'showGroupGrades', 'showNotifications', 'showGroupSidebar', 'showUnmerged', 'loadStories'];

    // logic to determine if we should activate whiteboard on this page
    chrome.storage.local.get(options, async function (result) {
        console.log(result);
        enabledPopup = result.enabled !== false;
        console.log("Extension has been " + (enabledPopup ? "en" : "dis") + "abled from the popup.");

        enabledDenylist = !denylist.some(x => window.location.href.includes(x));
        if (!enabledDenylist)
            console.log("Whiteboard has been explicitly denied on this page.")

        // only replace page if extension enabled and url starts with /webapps
        if (enabledPopup && enabledDenylist) {
            if (window.location.href.startsWith(urlPrefix)) {
                await start(result);
            } else if (window.location.href.includes("coursebook.utdallas.edu")) {
                await startCoursebook();
            }
        }
    });
})(); 

console.log('Whiteboard extension loaded!');

async function startCoursebook() {
    const src = chrome.runtime.getURL('js/coursebook.js');
    const contentScript = await import(src);
    contentScript.startCB();
}

async function start(options) {
    fetch(chrome.runtime.getURL("loading.html"))
        .then(response => response.text())
        .then(async function(template) {
            var originalHTML = document.getElementsByTagName("html")[0].innerHTML;
            document.getElementsByTagName("html")[0].innerHTML = template;
            const src = chrome.runtime.getURL('js/main.js');
            const contentScript = await import(src);
            var login = await contentScript.start(options);
            if(login) {
                document.getElementsByTagName("html")[0].innerHTML = originalHTML;
            }
        });
}