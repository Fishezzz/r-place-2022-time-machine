const BASE_URL = "https://rplace.space/combined/";

let data;
let cooldown;
let onCooldown = false;

function loadData() {
    // load json file
    let xhr = new XMLHttpRequest();
    if (xhr !== null) {
        xhr.open("GET", "./index-combined.json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // parse response
                    data = JSON.parse(xhr.responseText);

                    // set some initial values
                    slider.value = 0;
                    slider.max = data.length - 1;
                    datetime.innerHTML = data[0].date;
                }
            }
        }
        xhr.send();
    }
}

function sliderChanged(event) {
    if (!onCooldown) {
        image.src = BASE_URL + data[slider.value].file;
        datetime.innerHTML = data[slider.value].date;

        onCooldown = true;
        cooldown = setTimeout(() => { onCooldown = false; }, 200);
    } else {
        event.stopImmediatePropagation();
    }
}

let image = document.getElementById("image");
let datetime = document.getElementById("datetime");
let slider = document.getElementById("slider");

loadData();

// update image when slider changes
slider.addEventListener("change", sliderChanged);

// Make the DIV element draggable
dragElement(document.getElementById("draggable"));

function dragElement(elem) {
    let newX = 0, newY = 0, oldX = 0, oldY = 0;

    if (document.getElementById(elem.id + "header")) {
        // if present, the header is where you move the DIV from
        document.getElementById(elem.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV
        elem.onmousedown = dragMouseDown;
    }

    // start of dragging
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at startup
        oldX = e.clientX;
        oldY = e.clientY;

        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves
        document.onmousemove = elementDrag;

        elem.classList.add("move");
    }

    // while dragging
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // calculate the new cursor position
        newX = oldX - e.clientX;
        newY = oldY - e.clientY;
        oldX = e.clientX;
        oldY = e.clientY;

        // set the element's new position
        elem.style.top = (elem.offsetTop - newY) + "px";
        elem.style.left = (elem.offsetLeft - newX) + "px";
    }

    // end of dragging
    function closeDragElement() {
        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        elem.classList.remove("move");
    }
}
