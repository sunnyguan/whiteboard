const urlPrefix = "https://elearning.utdallas.edu/webapps";

// set checkbox
chrome.storage.local.get(['enabled'], function (result) {
    document.getElementById("enabledCheckbox").checked = result.enabled !== false;
});

function checkEnabled(element) {
    var isChecked = document.getElementById("enabledCheckbox").checked;
    chrome.storage.local.get(['enabled'], function (result) {
        var enabled = result.enabled !== false;
        if (enabled != isChecked) {
            // checkbox was updated
            // update local storage 
            chrome.storage.local.set({enabled: isChecked}, function() {
                console.log('Value is set to ' + isChecked);
            });
            // reload if we are on elearning
            chrome.tabs.query({active: true}, function (tab) {
                if (tab[0].url.startsWith(urlPrefix)) {
                    chrome.tabs.reload();
                }
            });
        }
    });
    
}

function init() {
    document.getElementById("enabledCheckbox").addEventListener('click', checkEnabled);
}

document.addEventListener('DOMContentLoaded', init);
