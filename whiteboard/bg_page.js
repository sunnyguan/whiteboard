chrome.runtime.onMessage.addListener(
    function (url, sender, onSuccess) {
        fetch(url)
            .then(response => response.text())
            .then(responseText => onSuccess(responseText))
            .catch(error => console.error(error));
        return true;
    }
);
