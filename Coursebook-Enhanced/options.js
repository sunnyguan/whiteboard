// Saves options to chrome.storage
function save_options() {
    var data1 = [];
    var data2 = [];
    document.querySelectorAll('div#group1 > label > input').forEach(el => {
        data1.push(el.checked);
    });
    document.querySelectorAll('div#group2 > label > input').forEach(el => {
        data2.push(el.checked);
    });
    save(data1, data2);
}

function save(data1, data2){
    chrome.storage.sync.set({
        desktop: data1,
        mobile: data2
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore() {
    var data1 = [true, true, true, true, true, true, true, true, true];
    var data2 = [true, true, true, true, true, true, false, false, false];
    document.querySelectorAll('div#group1 > label > input').forEach((el, id) => {
        el.checked = data1[id];
    });
    document.querySelectorAll('div#group2 > label > input').forEach((el, id) => {
        el.checked = data2[id];
    });
    save(data1, data2);
}

document.getElementById("restore").addEventListener("click", restore);

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        desktop: [],
        mobile: []
    }, function (items) {
        document.querySelectorAll('div#group1 > label > input').forEach((el, id) => {
            el.checked = items.desktop[id];
        });
        document.querySelectorAll('div#group2 > label > input').forEach((el, id) => {
            el.checked = items.mobile[id];
        });
        console.log(items);
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);