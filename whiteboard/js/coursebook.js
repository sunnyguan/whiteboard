export function startCB() {
    document.addEventListener('DOMContentLoaded', function () {
        viewport = document.querySelector("meta[name=viewport]");
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
        checkFlag();
    });
}


function checkFlag() {
    flag = document.querySelector("#sr > div > table > tbody") != null && document.querySelector("#sr > div > table > tbody").rows.length != 0 && document.querySelectorAll("#sr > div > table > thead > tr > th").length == 7;
    if (flag == false || waiting == true) {
        window.setTimeout(checkFlag, 1000);
    } else {
        document.querySelector("#sr > div > table").classList.add('table-responsive-full');
        var rows = document.querySelector("#sr > div > table > tbody").rows
        var len = document.querySelector("#sr > div > table > tbody").rows.length
        var names = [];
        for (var i = 0; i < len; i++) {
            var element = rows[i]["cells"][4];
            var text = element.textContent;
            names.push(text);
        }
        multipleCalls(names);
        flag = false;
        window.setTimeout(checkFlag, 1000);
    }
}

function multipleCalls(names) {
    var uri = "https://utdrmp.herokuapp.com/api/rmp?";
    for (var name of names) {
        uri += "names=" + name + "&";
    }
    chrome.runtime.sendMessage(uri, data => process(data));
    waiting = true;
}

function process(data) {
    var k = JSON.parse(data);
    insertColumn(4, 'RMP');
    insertColumn(5, 'GPA');
    for (var i = 0; i < k.length; i++) {
        var element = document.querySelector("#sr > div > table > tbody").rows[i]["cells"];
        let heading1 = document.createElement('a');
        heading1.textContent = k[i].rating.replace("based on ", "(").replace(" ratings", ")");
        if (k[i].link == 'N/A') {
            heading1 = document.createElement('p');
            heading1.textContent = "0 (N/A)";
        } else {
            heading1.href = `https://www.ratemyprofessors.com/ShowRatings.jsp?tid=${k[i].link}`
        }

        let heading2 = document.createElement('a');
        if (k[i].avgGPA.includes("0 Records")) {
            heading2 = document.createElement('p');
        } else {
            heading2.href = `https://saitanayd.github.io/utd-grades/?prof=${k[i].name}`;
        }
        heading2.textContent = k[i].avgGPA.replace("with ", "(").replace(" students", ")").replace("0 Records Found", "0 (N/A)");

        element[4].append(heading1);
        element[5].append(heading2);
    }

    document.querySelectorAll('#sr > div > table > tbody > td:nth-child(2)').forEach(el => {
        el.textContent = el.textContent.replace("Semester Credit", " ");
    })
    waiting = false;
}

function insertColumn(index, name) {
    for (var k of document.querySelectorAll(`#sr div table tbody td:nth-child(${index})`)) {
        k.insertAdjacentElement('afterend', document.createElement('td'));
    }
    let heading = document.createElement('th');
    heading.onclick = function () { sort(index) };
    heading.textContent = name;
    document.querySelector(`#sr > div > table > thead > tr > th:nth-child(${index - 1})`).insertAdjacentElement('afterend', heading);
}

function getCellValue(tr, idx) {
    return tr.children[idx].innerText || tr.children[idx].textContent;
}

function comparer(idx, asc) {
    return function (a, b) {
        return ((v1, v2) =>
            v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
    }
}


var asc = true;
function sort(thid) {
    var th = document.querySelector(`#sr > div > table > thead > tr > th:nth-child(${thid + 1})`)
    const table = th.closest('table').querySelector('tbody');
    Array.from(table.querySelectorAll('tr:nth-child(n+1)'))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), asc = !asc))
        .forEach(tr => table.appendChild(tr));
    var odd = false;
    for (var c of document.querySelector("#sr > div > table > tbody").rows) {
        if (odd) {
            c.classList.remove("odd");
            c.classList.add("even");
        } else {
            c.classList.add("odd");
            c.classList.remove("even");
        }
        odd = !odd;
    }
}

function show(id, block) {
    document.querySelectorAll(`td:nth-child(${id}), th:nth-child(${id})`).forEach(el => {
        el.style.display = block ? "table-cell" : "none";
    })
}