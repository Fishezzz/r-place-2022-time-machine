// start: 1648764000000
//   end: 1649064000000
function pixelsLoaded() {
    slider.value = 1649064000000;
    updateTime();

    // add eventListeners
    dragElement(canvas);
    slider.onchange = updateTime;
    zoom_in.onclick = zoomIn;
    zoom_out.onclick = zoomOut;
    window.onresize = () => {
        pixel_ratio_X = window.screen.width / window.screen.availWidth;
        pixel_ratio_Y = window.screen.height / window.screen.availHeight;
        updateView();
    }
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

function updateCanvas(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x1 = center.x - half_canvas_scaled_floor;
    let y1 = center.y - half_canvas_scaled_floor;
    let x2 = center.x + half_canvas_scaled_floor;
    let y2 = center.y + half_canvas_scaled_floor;
    console.log(
        "canvas:", canvas.width + "x" + canvas.height,
        ", scale:", scale,
        ", view:", (x2 - x1) + "x" + (y2 - y1),
        ", center:", center,
        "(" + x1, y1 + ")", "(" + x2, y2 + ")"
    );

    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            ctx.fillStyle = findPixel(x, y, timestamp).pixel_color;
            ctx.fillRect((x - x1) * scale, (y - y1) * scale, scale, scale);
        }
    }
}

function updateTime() {
    datetime.innerHTML = toDataString(slider.value);
    updateCanvas(slider.value);
}

function updateView(changeX = 0, changeY = 0) {
    // change values "old_pos - new_pos"
    /*
     *  ___________  . . . . .
     * |     .     |         .
     * |     .     |         .
     * | . . x . . |         .
     * |     .     |         .
     * |_____._____|         .
     * .                     .
     * .               x . . .
     * .               .     .
     * .               .     .
     * . . . . . . . . . . . .
     * 
     * "half-canvas" ---[x]---> "SIZE - half-canvas"
     * 
     * X: 0 -> 1 => changeX = -1
     * X: 1 -> 0 => changeX = 1
     * 
     * Y: 0 -> 1 => changeY = -1
     * Y: 1 -> 0 => changeY = 1
    **/

    // check borders
    if (center.x + changeX < HALF_CANVAS) {
        changeX = HALF_CANVAS - center.x;
    } else if (center.x + changeX > SIZE - 1 - HALF_CANVAS) {
        changeX = SIZE - 1 - HALF_CANVAS - center.x;
    }
    if (center.y + changeY < HALF_CANVAS) {
        changeY = HALF_CANVAS - center.y;
    } else if (center.y + changeY > SIZE - 1 - HALF_CANVAS) {
        changeY = SIZE - 1 - HALF_CANVAS - center.y;
    }

    // update center
    center.x += changeX;
    center.y += changeY;

    // if there are no changes, no need to update canvas
    if (changeX === 0 && changeY === 0) return;

    // sanity checks
    if (center.x < 0 || center.x >= SIZE || center.y < 0 || center.y >= SIZE) {
        alert("IT FUCKED");
        center.x = HALF_CANVAS;
        center.y = HALF_CANVAS;
    }

    // update canvas
    updateCanvas(slider.value);
}

// movement
function dragElement(elem) {
    let changeX = 0, changeY = 0, oldX = 0, oldY = 0;

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
        document.onmousemove = elementDrag;
    }

    // while dragging
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // calculate the new cursor position
        changeX = oldX - e.clientX;
        changeY = oldY - e.clientY;
        oldX = e.clientX;
        oldY = e.clientY;

        // change in positive X: 50 -> 100 => newX = 50 - 100 = -50
        // changes will always be negative / inverted values of their direction
        updateView(changeX * pixel_ratio_X, changeY * pixel_ratio_Y);
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
        changeX = oldX - e.touches[0].clientX;
        changeY = oldY - e.touches[0].clientY;
        oldX = e.touches[0].clientX;
        oldY = e.touches[0].clientY;

        // change in positive X: 50 -> 100 => newX = 50 - 100 = -50
        // changes will always be negative / inverted values of their direction
        updateView(changeX * pixel_ratio_X, changeY * pixel_ratio_Y);
    }

    // end of touch
    function touchEnd() {
        // stop moving when no longer touching
        document.ontouchcancel = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}

function zoomIn() {
    if (scale < SCALE_MAX) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        scale *= 2
        half_canvas_scaled_floor = Math.floor(HALF_CANVAS / scale);
        updateCanvas(slider.value);
    }
}

function zoomOut() {
    if (scale > SCALE_MIN) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        scale /= 2
        half_canvas_scaled_floor = Math.floor(HALF_CANVAS / scale);
        updateCanvas(slider.value);
    }
}

const SIZE = 2000;
const HALF_CANVAS = 256;
const SCALE_MIN = 1;
const SCALE_MAX = 16;

let datetime = document.getElementById("datetime");
let slider = document.getElementById("slider");
let zoom_out = document.getElementById("zoom_out");
let zoom_in = document.getElementById("zoom_in");

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext('2d');
canvas.width = 2 * HALF_CANVAS;
canvas.height = 2 * HALF_CANVAS;

let scale = 4;
let half_canvas_scaled_floor = Math.floor(HALF_CANVAS / scale);

let pixel_ratio_X = window.screen.width / window.screen.availWidth;
let pixel_ratio_Y = window.screen.height / window.screen.availHeight;

let center = { x: HALF_CANVAS, y: HALF_CANVAS };

loadPixelData().then(() => pixelsLoaded);
