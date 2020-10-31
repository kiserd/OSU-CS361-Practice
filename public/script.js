var url = 'http://flip3.engr.oregonstate.edu:6033';

document.addEventListener('DOMContentLoaded', bindButtons);

function bindButtons(){
    document.getElementById("submitNewExercise").addEventListener('click', addSet);
    document.getElementById("dispTbody").addEventListener('click', deleteSet);
    document.getElementById("dispTbody").addEventListener('click', editSet);
    document.getElementById("dispTbody").addEventListener('click', updateSet);
    document.getElementById("dispTbody").addEventListener('click', toggleButtonContent);
    document.getElementById("resetTable").addEventListener('click', resetTable);
}

function resetTable(event) {
    var req = new XMLHttpRequest();
    var resource = url + '/reset-table';
    req.open('GET', resource, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            document.getElementById("dispTbody").innerHTML = "";
            buildTbody(response);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(null);
    event.preventDefault();
}

function toggleButtonContent(event) {
    let target = event.target;
    if (target.tagName != "BUTTON" || (target.textContent != "Edit" && target.textContent != "Update")) {
        return;
    }
    if (target.textContent == "Edit") {
        target.textContent = "Update";
    }
    else {
        target.textContent = "Edit";
    }
}

function editSet(event) {
    let target = event.target;
    if (target.tagName != "BUTTON" || target.textContent != "Edit") {
        return;
    }
    toggleReadOnly(target);
}

function updateSet(event) {
    let target = event.target;
    if (target.tagName != "BUTTON" || target.textContent != "Update") {
        return;
    }
    var id = getIDFromButton(target);
    var payload = buildPayload(target);
    sendUpdate(payload);
}

function toggleReadOnly(button) {
    var targetRow = button.parentNode.parentNode;
    for (var i = 0; i < targetRow.children.length - 2; i++) {
        var targetCell = targetRow.children[i];
        var targetInput = targetCell.children[0];
        targetInput.readOnly = false;
    }
}

function buildPayload(button) {
    payload = {
        id: null,
        updateArr: []
    };
    var targetRow = button.parentNode.parentNode;
    
    // build payload's updateArr property
    for (var i = 1; i < targetRow.children.length - 2; i++) {
        var targetCell = targetRow.children[i];
        var targetInput = targetCell.children[0];
        payload["updateArr"].push(targetInput.value);
    }
    payload["id"] = targetRow.children[0].children[0].value;
    return payload;
}

function sendUpdate(payload) {
    var req = new XMLHttpRequest();
    var resource = url + '/';
    req.open('PUT', resource, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            document.getElementById("dispTbody").innerHTML = "";
            buildTbody(response);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function deleteSet(event) {
    let target = event.target;
    if (target.tagName != "BUTTON" || target.textContent != "Delete") {
        return;
    }
    var id = getIDFromButton(target);
    sendDelete(id);
}

function getIDFromButton(button) {
    var targetRow = button.parentNode.parentNode;
    var targetCell = targetRow.children[0];
    var targetInput = targetCell.children[0];
    var id = targetInput.value;
    return id;
}

function sendDelete(deleteId) {
    var payload = {id: deleteId}; 
    var req = new XMLHttpRequest();
    var resource = url + '/';
    req.open('DELETE', resource, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            document.getElementById("dispTbody").innerHTML = "";
            buildTbody(response);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

function addSet(event) {
    var payload = { 
        name: null,
        reps: null,
        weight: null,
        date: null,
        unit: null
    };
    payload.name = document.getElementById("nameInput").value;
    payload.reps = document.getElementById("repsInput").value;
    payload.weight = document.getElementById("weightInput").value;
    payload.date = document.getElementById("dateInput").value;
    if (document.getElementById("lbRadio").checked){
        payload.unit = 0
    }
    else if (document.getElementById("kgRadio").checked) {
        payload.unit = 1
    }
    var req = new XMLHttpRequest();
    var resource = url + '/';
    req.open('POST', resource, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            document.getElementById("dispTbody").innerHTML = "";
            buildTbody(response);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
    event.preventDefault();
}

// build tbody of shopping list
function buildTbody(rows) {
    var myTbody = document.getElementById("dispTbody");
    for (var i = 0; i < rows.length; i++) {
        var newRow = document.createElement("tr");
        var col = 0;
        for (key in rows[i]) {
            // create input element to populate the <td>
            newInput = document.createElement("input");
            newInput.value = rows[i][key];
            newInput.className = "form-control"
            newInput.readOnly = true;

            // change type of input depending on column
            if (key == "name") {
                newInput.setAttribute("type", "text");
            }
            else if (key == "reps" || key == "weight" || key == "id") {
                newInput.setAttribute("type", "number");
            }
            else if (key == "date") {
                newInput.setAttribute("type", "date");
            }
            else {
                newInput.setAttribute("type", "text");
            }

            // create <td> and hide from client if it is the id column
            newData = document.createElement("td");
            if (key == "id") {
                newData.className = "d-none";
            }

            newData.appendChild(newInput);
            newRow.appendChild(newData);
            col++;
        }
        // add edit/delete buttons to each row
        newData = document.createElement("td");
        newButton = document.createElement("button");
        newButton.textContent = "Edit";
        newButton.className = "btn btn-primary";
        newData.appendChild(newButton);
        newRow.appendChild(newData);
        newData = document.createElement("td");
        newButton = document.createElement("button");
        newButton.textContent = "Delete";
        newButton.className = "btn btn-primary";
        newData.appendChild(newButton);
        newRow.appendChild(newData);
        myTbody.appendChild(newRow);
    }
}