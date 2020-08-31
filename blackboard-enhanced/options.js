function restore_options() {
    console.log('hi');
    chrome.storage.sync.get(['id', 'interval'], function (result) {
        if(result.id){
            var url = "https://coolapis.herokuapp.com/ics?ptg=" + result.id;
            document.getElementById("text").innerHTML = "URL: <a href=\"" + url + "\">" + url + "</a>";
        }
        if(result.interval){
            document.getElementById("alert").textContent = "Current update interval: " + result.interval;
        }
    });
    document.getElementById("input").addEventListener("keyup", save_interval);
    
}

function save_interval() {
    event.preventDefault();
    if (event.keyCode === 13) {
        var val = document.getElementById("input").value;
        console.log(val);
        if(!isNaN(val)){
            chrome.storage.sync.set({
                interval: +val
            }, function () {
                console.log("Interval updated to " + val);
                document.getElementById("alert").textContent = "Current update interval: " + val;
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', restore_options);