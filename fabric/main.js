function pixelsLoaded() {
    slider.value = 1648764000000;
    datetime.innerHTML = toDataString(slider.value);
    updateCanvas(1648764000000, 0, 0, 1000, 1000);

    slider.addEventListener("change", sliderChanged);
}

/**
 * Updates the canvas with pixels from within the given area, or the whole canvas.
 * Uses the most recent update for each pixel from before, or at, the given timestamp.
 */
function updateCanvas(timestamp, x1 = 0, y1 = 0, x2 = 1999, y2 = 1999) {
    // console.log("Updating canvas (" + timestamp + ") ...");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            ctx.fillStyle = findPixel(x, y, timestamp).pixel_color;
            ctx.fillRect(x, y, scale, scale);
        }
    }
    // console.log("Finished updating canvas");
}

function findPixel(x, y, timestamp) {
    return pixels[x][y]
        .filter(updates => updates.timestamp <= timestamp)
        .reduce((prev, curr) => prev.timestamp > curr.timestamp ? prev : curr);
}

function sliderChanged() {
    datetime.innerHTML = toDataString(slider.value);
    updateCanvas(slider.value, 0, 0, 1000, 1000);
}

function toDataString(timestamp) {
    let date = new Date(+timestamp);
    return date.toString().split(' GMT')[0] + "." + date.getTime().toString().substring(0, 3);
}

let datetime = document.getElementById("datetime");
let slider = document.getElementById("slider");

let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext('2d');
let scale = 1;

loadPixelData().then(() => pixelsLoaded);
