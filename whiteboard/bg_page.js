chrome.runtime.onMessage.addListener(
    function (url, sender, onSuccess) {
        fetch(url)
            .then(response => response.text())
            .then(responseText => sendResponse(responseText))
            .catch(error => {
                console.error('Fetch error: ', error);
                sendResponse(null);
            });
        return true;
    }
);