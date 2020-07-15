console.log('Coursebook extension loaded!');

// change "cs xxx" to "csxxx" for coursebook searching
/* document.querySelector("#classsearch > a").onclick = function() {
    console.log('hi');
    var search = document.querySelector("#srch").value;
    if(search.startsWith("cs ")) document.querySelector("#srch").value = search.replace("cs ", "cs");
}*/
flag = false;
waiting = false;
function checkFlag() {
    flag = document.querySelector("#sr > div > table > tbody") != null && document.querySelector("#sr > div > table > tbody").rows.length != 0 && document.querySelectorAll("#sr > div > table > thead > tr > th").length == 7;
    if (flag == false || waiting == true) {
        // console.log('checking...');
        window.setTimeout(checkFlag, 1000);
    } else {
        var rows = document.querySelector("#sr > div > table > tbody").rows
        var len = document.querySelector("#sr > div > table > tbody").rows.length
        var names = [];
        for (var i = 0; i < len; i++) {
            var element = rows[i]["cells"][3];
            var text = element.textContent;
            names.push(text);
        }
        multipleCalls(names);
        flag = false;
        window.setTimeout(checkFlag, 1000);
    }
}
checkFlag();
function multipleCalls(names) {
    console.log('calling!');
    var uri = "https://utdrmp.herokuapp.com/api/rmp?";
    for (const name of names) {
        uri += "names=" + name + "&";
    }
    chrome.runtime.sendMessage(uri, data => process(data));
    console.log('done calling!');
    waiting = true;
}

function process(data) {
    var k = JSON.parse(data);
    console.log(k);
    insertColumn(4, 'RMP');
    insertColumn(5, 'GPA');
    for (var i = 0; i < k.length; i++) {
        var element = document.querySelector("#sr > div > table > tbody").rows[i]["cells"];
        let heading1 = document.createElement('a');
        console.log(k[i].rating);
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
    waiting = false;
}

function insertColumn(index, name) {
    for (var k of document.querySelectorAll(`#sr div table tbody td:nth-child(${index})`)) {
        k.insertAdjacentElement('afterend', document.createElement('td'));
    }
    let heading = document.createElement('th');
    heading.onclick = function () { sort(index) };
    heading.textContent = name;
    document.querySelector(`#sr > div > table > thead > tr > th:nth-child(${index})`).insertAdjacentElement('afterend', heading);
}

getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

comparer = (idx, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
)(this.getCellValue(asc ? a : b, idx), this.getCellValue(asc ? b : a, idx));
var asc = true;
function sort(thid) {
    var th = document.querySelector(`#sr > div > table > thead > tr > th:nth-child(${thid + 1})`)
    const table = th.closest('table').querySelector('tbody');
    Array.from(table.querySelectorAll('tr:nth-child(n+1)'))
        .sort(this.comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
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