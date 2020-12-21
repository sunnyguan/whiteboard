const urlPrefix = "https://elearning.utdallas.edu/webapps";

var options = ['enabled', 'showGroupGrades', 'showNotifications', 'showGroupSidebar', 'loadStories'];
var defaults = [true, false, false, false, false];

// set checkbox
chrome.storage.local.get(options, function (result) {
    var id = 0;
    for (var p of options) {
        if(result[p] == null) 
            document.getElementById(p).checked = defaults[id];
        else
            document.getElementById(p).checked = result[p];
        id++;
    }
});

function deepEqual(x, y) {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
        ok(x).length === ok(y).length &&
        ok(x).every(key => deepEqual(x[key], y[key]))
    ) : (x === y);
}

function checkEnabled(element) {
    debugger
    var isChecked = [];
    for (var option of options) {
        isChecked[option] = document.getElementById(option).checked;
    }
    chrome.storage.local.get(options, function (result) {
        var update = !deepEqual(result, isChecked);

        if (update) {
            // update local storage 
            chrome.storage.local.set({...isChecked}, function () {
                console.log(isChecked);
            });
            // reload if we are on elearning (TODO: disabled to not require tabs permission)
            // (we promise your tabs are safe)
            // chrome.tabs.query({ active: true }, function (tab) {
            //     console.log(tab);
            //     if (tab[0].url.startsWith(urlPrefix)) {
            //         chrome.tabs.reload();
            //     }
            // });
        }
    });

}

function init() {
    for (var p of options) {
        document.getElementById(p).addEventListener('click', checkEnabled);
    }
}

document.addEventListener('DOMContentLoaded', init);
