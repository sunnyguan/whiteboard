(async() => {
    fetch(chrome.extension.getURL("base.html"))
    .then(res => res.text())
    .then((template) => {
        document.getElementsByTagName("html")[0].innerHTML = template;
        var script = document.createElement('script');
        script.src = chrome.extension.getURL('base.bundle.js');
        document.getElementsByTagName("head")[0].appendChild(script);
    });
})(); 