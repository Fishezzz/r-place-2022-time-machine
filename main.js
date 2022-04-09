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
                    datetime.innerHTML = dateFromFilename(data[0].file);
                }
            }
        }
        xhr.send();
    }
}

function sliderChanged(event) {
    if (!onCooldown) {
        image.src = BASE_URL + data[slider.value].file;
        datetime.innerHTML = dateFromFilename(data[slider.value].file);

        onCooldown = true;
        cooldown = setTimeout(() => { onCooldown = false; }, 200);
    } else {
        event.stopImmediatePropagation();
    }
}

function dateFromFilename(filename) {
    let unix = parseInt(filename.split('.')[0]);
    let date = new Date(unix * 1000);
    return date.toUTCString();
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

    elem.onmousedown = startDragElement;
    elem.ontouchstart = touchStart;

    ////// Desktop
    // start of dragging
    function startDragElement(e) {
        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at startup
        oldX = e.clientX;
        oldY = e.clientY;

        document.onmouseup = endDragElement;
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
    function endDragElement() {
        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        elem.classList.remove("move");
    }

    ////// Mobile
    // start of touch
    function touchStart(e) {
        e = e || window.event;
        e.preventDefault();

        // get the touch position at startup
        oldX = e.touches[0].clientX
        oldY = e.touches[0].clientY;

        document.ontouchcancel = touchEnd;
        document.ontouchend = touchEnd;
        // call a function whenever the touch moves
        document.ontouchmove = touchMoveElement;
    }

    // while moving
    function touchMoveElement(e) {
        e = e || window.event;
        e.preventDefault();

        // calculate the new position
        newX = oldX - e.touches[0].clientX;
        newY = oldY - e.touches[0].clientY;
        oldX = e.touches[0].clientX;
        oldY = e.touches[0].clientY;

        // set the element's new position
        elem.style.top = (elem.offsetTop - newY) + "px";
        elem.style.left = (elem.offsetLeft - newX) + "px";
    }

    // end of touch
    function touchEnd() {
        // stop moving when no longer touching
        document.ontouchcancel = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}
