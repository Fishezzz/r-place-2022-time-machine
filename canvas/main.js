function init() {
    canvas.width = 2 * HALF_CANVAS;
    canvas.height = 2 * HALF_CANVAS;

    // setup loader
    canvas.setAttribute("style", "display: none;");
    loader.setAttribute("style", "margin: calc((" + canvas.width + "px - 60px - 16px) / 2);");

    scale = 4;
    half_canvas_scaled_floor = Math.floor(HALF_CANVAS / scale);
    zoom.innerHTML = "x" + scale;

    pixel_ratio_X = window.screen.width / window.screen.availWidth;
    pixel_ratio_Y = window.screen.height / window.screen.availHeight;

    loadPixelData().then(() => pixelsLoaded);
}

function pixelsLoaded() {
    // update slider
    slider.value = 1649064000000;
    updateTime();

    // remove loader
    loader.remove();
    canvas.removeAttribute("style");

    // add eventListeners
    dragElement(canvas);
    slider.onchange = updateTime;
    zoom_in.onclick = zoomIn;
    zoom_out.onclick = zoomOut;
    window.onresize = () => {
        pixel_ratio_X = window.screen.width / window.screen.availWidth;
        pixel_ratio_Y = window.screen.height / window.screen.availHeight;
        resized = true;
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

    // calculate how many non-scald pixel need to be drawn around the center
    // and the non-scaled corner pixels of the viewing window
    let x1 = center.x - half_canvas_scaled_floor;
    let y1 = center.y - half_canvas_scaled_floor;
    let x2 = center.x + half_canvas_scaled_floor;
    let y2 = center.y + half_canvas_scaled_floor;

    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            // get the pixel data for a pixel in the viewing window
            ctx.fillStyle = findPixel(x, y, timestamp).pixel_color;
            // pixels are drawn relative to the center of the window, but
            //   this distance also needs to be scaled to the scaling factor
            // pixels are drawn with a size equal to the scaling factor
            ctx.fillRect((x - x1) * scale, (y - y1) * scale, scale, scale);
        }
    }
}

function updateTime() {
    datetime.innerHTML = toDataString(slider.value);
    updateCanvas(slider.value);
}

function updateView(changeX = 0, changeY = 0) {
    /*
     * Canvas borders:
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
     * 
     * Directon changes:
     * X: 0 -> 1 => changeX = -1
     * X: 1 -> 0 => changeX = 1
     * 
     * Y: 0 -> 1 => changeY = -1
     * Y: 1 -> 0 => changeY = 1
     * 
     * But mouse moves in opposite direction of the direction
     *   we want the canvas to move
     * X: 0 -> 1 => mouseX = 1  canvasX = -1
     * X: 1 -> 0 => mouseX = -1 canvasX = 1
     * 
     * Y: 0 -> 1 => mouseY = 1  canvasY = -1
     * Y: 1 -> 0 => mouseY = -1 canvasY = 1
    **/

    // check borders
    if (center.x + changeX < half_canvas_scaled_floor) {
        if (resized) { // when resizing at borders, view might be partially outside of the edges
            center.x = half_canvas_scaled_floor;
        } else { // if it would go too far to the left
            changeX = half_canvas_scaled_floor - center.x;
        }
    } else if (center.x + changeX > SIZE - 1 - half_canvas_scaled_floor) {
        if (resized) { // when resizing at borders, view might be partially outside of the edges
            center.x = SIZE - 1 - half_canvas_scaled_floor;
        } else { // if it would go too far to the right
            changeX = SIZE - 1 - half_canvas_scaled_floor - center.x;
        }
    }
    if (center.y + changeY < half_canvas_scaled_floor) {
        if (resized) { // when resizing at borders, view might be partially outside of the edges
            center.y = half_canvas_scaled_floor;
        } else { // if it would go too far to the top
            changeY = half_canvas_scaled_floor - center.y;
        }
    } else if (center.y + changeY > SIZE - 1 - half_canvas_scaled_floor) {
        if (resized) { // when resizing at borders, view might be partially outside of the edges
            center.y = SIZE - 1 - half_canvas_scaled_floor;
        } else { // if it would go too far to the bottom
            changeY = SIZE - 1 - half_canvas_scaled_floor - center.y;
        }
    }

    // if there are no changes, no need to update canvas
    if (changeX === 0 && changeY === 0 && !resized) return;

    resized = false;

    // update center
    center.x += changeX;
    center.y += changeY;

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
        zoom.innerHTML = "x" + scale;
        resized = true;

        updateView();
    }
}

function zoomOut() {
    if (scale > SCALE_MIN) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        scale /= 2
        half_canvas_scaled_floor = Math.floor(HALF_CANVAS / scale);
        zoom.innerHTML = "x" + scale;
        resized = true;

        updateView();
    }
}

const SIZE = 2000;
const HALF_CANVAS = 512;
const SCALE_MIN = 1;
const SCALE_MAX = 16;

// get HTML elements
let datetime = document.getElementById("datetime");
let slider = document.getElementById("slider");
let zoom_out = document.getElementById("zoom_out");
let zoom_in = document.getElementById("zoom_in");
let zoom = document.getElementById("zoom");
let loader = document.getElementById("loader");

// prepare canvas and drawing context
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext('2d');

// global variables
let resized = false;
let scale, half_canvas_scaled_floor, pixel_ratio_X, pixel_ratio_Y;
let center = { x: HALF_CANVAS, y: HALF_CANVAS };

init();
