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

    let x1 = Math.max(Math.min(SIZE - 1, view.corner1.x), 0);
    let y1 = Math.max(Math.min(SIZE - 1, view.corner1.y), 0);
    let x2 = Math.min(Math.max(0, view.corner2.x), SIZE - 1);
    let y2 = Math.min(Math.max(0, view.corner2.y), SIZE - 1);

    let log = '';
    log += x1 === view.corner1.x ? '   ' : 'x1 ';
    log += y1 === view.corner1.y ? '   ' : 'y1 ';
    log += x2 === view.corner2.x ? '   ' : 'x2 ';
    log += y2 === view.corner2.y ? '   ' : 'y2 ';
    console.log(log);

    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            ctx.fillStyle = findPixel(x, y, timestamp).pixel_color;
            ctx.fillRect(x - x1, y - y1, 1, 1);
        }
    }
}

function updateTime() {
    datetime.innerHTML = toDataString(slider.value);
    updateCanvas(slider.value);
}

function updateView(changeX = 0, changeY = 0) {
    // check for borders
    if (view.center.x + changeX < 0) {
        changeX = 0 - view.center.x;
    } else if (view.center.x + changeX > SIZE - 1) {
        changeX = SIZE - 1 - view.center.x;
    }
    if (view.center.y + changeY < 0) {
        changeY = 0 - view.center.y;
    } else if (view.center.y + changeY > SIZE - 1) {
        changeY = SIZE - 1 - view.center.y;
    }

    // update center
    view.center.x += changeX;
    view.center.y += changeY;

    // sanity checks
    if (view.center.x < -2000 || view.center.x >= 2000 || view.center.y < -2000 || view.center.y >= 2000) {
        alert("IT FUCKED");
        view.center.x = HCW;
        view.center.y = HCH;
    }

    // update corners
    view.corner1.x = view.center.x - HCW / scale;
    view.corner1.y = view.center.y - HCH / scale;

    view.corner2.x = view.center.x + HCW / scale;
    view.corner2.y = view.center.y + HCH / scale;

    console.log(view.corner1, view.center, view.corner2);

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
        // updateView(newX * -0.1, newY * -0.1);
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
        // updateView(newX * -0.1, newY * -0.1);
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
        ctx.scale(2, 2);
        updateCanvas(slider.value);
    }
}

function zoomOut() {
    if (scale > SCALE_MIN) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        scale /= 2
        ctx.scale(0.5, 0.5);
        updateCanvas(slider.value);
    }
}

let datetime = document.getElementById("datetime");
let slider = document.getElementById("slider");
let zoom_out = document.getElementById("zoom_out");
let zoom_in = document.getElementById("zoom_in");

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;

const SIZE = 2000;
const SCALE_MIN = 0.5;
const SCALE_MAX = 4;

let scale = 2;

let pixel_ratio_X = window.screen.width / window.screen.availWidth;
let pixel_ratio_Y = window.screen.height / window.screen.availHeight;

/** half the canvas width */
const HCW = canvas.width / 2;
/** half the canvas height */
const HCH = canvas.height / 2;

// reference point in pixel coordinates
let view = {
    center: { x: HCW, y: HCH },
    corner1: { x: 0, y: 0 },
    corner2: { x: canvas.width, y: canvas.height }
}

loadPixelData().then(() => pixelsLoaded);
