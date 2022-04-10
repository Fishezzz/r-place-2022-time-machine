// start: 1648764000000
//   end: 1649064000000
const SIZE = 2000;

function pixelsLoaded() {
    slider.value = 1649064000000;
    sliderChanged();

    dragElement(canvas);
    slider.onchange = sliderChanged;
}

function findPixel(x, y, timestamp) {
    return pixels[x][y]
        .filter(updates => updates.timestamp <= timestamp)
        .reduce((prev, curr) => prev.timestamp > curr.timestamp ? prev : curr);
}

function toDataString(timestamp) {
    let date = new Date(+timestamp);
    return date.toString().split(' GMT')[0] + "." + date.getTime().toString().substring(0, 3);
}

/*
    function updateCanvas(timestamp, x1 = 0, y1 = 0, x2 = 1999, y2 = 1999) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                ctx.fillStyle = findPixel(x, y, timestamp).pixel_color;
                ctx.fillRect(x, y, scale, scale);
            }
        }
    }
*/
function updateCanvas(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let [x1, y1] = [...corner1];
    let [x2, y2] = [...corner2];

    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            ctx.fillStyle = findPixel(x, y, timestamp).pixel_color;
            ctx.fillRect(x, y, scale, scale);
        }
    }
}


function sliderChanged() {
    datetime.innerHTML = toDataString(slider.value);
    // updateCanvas(slider.value, ...corner1, ...corner2);
    updateCanvas(slider.value);
}

// movement
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
        oldX = e.clientX / 5;
        oldY = e.clientY / 5;

        document.onmouseup = endDragElement;
        document.onmousemove = elementDrag;
    }

    // while dragging
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // calculate the new cursor position
        newX = oldX - e.clientX / 5;
        newY = oldY - e.clientY / 5;
        oldX = e.clientX / 5;
        oldY = e.clientY / 5;

        // change in positive X: 50 -> 100 => newX = 50 - 100 = -50
        // changes will always be negative / inverted values of their direction
        updateView(newX * -1, newY * -1);
    }

    // end of dragging
    function endDragElement() {
        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
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

        // change in positive X: 50 -> 100 => newX = 50 - 100 = -50
        // changes will always be negative / inverted values of their direction
        updateView(newX * -1, newY * -1);
    }

    // end of touch
    function touchEnd() {
        // stop moving when no longer touching
        document.ontouchcancel = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }

    function updateView(changeX = 0, changeY = 0) {
        // For pixels
        if (changeX > 0) {
            if (corner2[0] + changeX > SIZE - 1) {
                changeX = SIZE - 1 - corner2[0];
            }
        } else {
            if (corner1[0] + changeX < 0) {
                changeX = 0 - corner1[0];
            }
        }
        corner1[0] = Math.floor(corner1[0] + changeX);
        corner2[0] = Math.floor(corner2[0] + changeX);

        if (changeY > 0) {
            if (corner2[1] + changeY > SIZE - 1) {
                changeY = SIZE - 1 - corner2[1];
            }
        } else {
            if (corner1[1] + changeY < 0) {
                changeY = 0 - corner1[1];
            }
        }
        corner1[1] = Math.floor(corner1[1] + changeY);
        corner2[1] = Math.floor(corner2[1] + changeY);

        //// For canvas
        // if (changeX > 0) {
        //     if (corner1[0] + changeX > HCW) {
        //         changeX = HCW - corner1[0];
        //     }
        // } else {
        //     if (corner2[0] + changeX < HCW) {
        //         changeX = HCW - corner2[0];
        //     }
        // }
        // corner1[0] = Math.floor(corner1[0] + changeX);
        // corner2[0] = Math.floor(corner2[0] + changeX);

        // if (changeY > 0) {
        //     if (corner1[1] + changeY > HCH) {
        //         changeY = HCH - corner1[0];
        //     }
        // } else {
        //     if (corner2[1] + changeY < HCH) {
        //         changeY = HCH - corner2[1];
        //     }
        // }
        // corner1[1] = Math.floor(corner1[1] + changeY);
        // corner2[1] = Math.floor(corner2[1] + changeY);

        sliderChanged();
    }
}

function zoomIn() {

}

function zoomOut() {

}

let datetime = document.getElementById("datetime");
let slider = document.getElementById("slider");
let zoom_out = document.getElementById("zoom_out");
let zoom_in = document.getElementById("zoom_in");

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext('2d');

/** half the canvas width */
const HCW = canvas.width / 2;
/** half the canvas height */
const HCH = canvas.height / 2;

// to scale pixel coordinates to canvas coordinates
let scale = 1;
// all true pixel coordinates
let corner1 = [0, 0];
let corner2 = [canvas.width, canvas.height];
let center = () => [
    Math.floor((corner1[0] + corner2[0]) / 2),
    Math.floor((corner1[1] + corner2[1]) / 2)
];

loadPixelData().then(() => pixelsLoaded);
