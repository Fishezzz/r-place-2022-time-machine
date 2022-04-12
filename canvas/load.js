// create 3D-array, for X, Y and timestamp indexing
let pixels = Array.from(
    Array(2000),
    () => Array.from(
        Array(2000),
        () => [{ "timestamp": 1648764000000, "user_id": "", "pixel_color": "#FFFFFF" }]
    )
);

async function loadPixelData() {
    const LENGTH = 5;

    let xhr1 = new XMLHttpRequest();
    if (xhr1 !== null) {
        xhr1.open("GET", "../data/2022_place_canvas_history-000000000000-1.csv", true);
        xhr1.onreadystatechange = () => {
            if (xhr1.readyState === 4) {
                if (xhr1.status === 200) {
                    // request part 2
                    let xhr2 = new XMLHttpRequest();
                    if (xhr2 !== null) {
                        xhr2.open("GET", "../data/2022_place_canvas_history-000000000000-2.csv", true);
                        xhr2.onreadystatechange = () => {
                            if (xhr2.readyState === 4) {
                                if (xhr1.status === 200) {
                                    console.log("Processing pixels part 2...");

                                    // parse response
                                    let allText2 = xhr1.responseText;
                                    let allLines2 = allText2.split(/\r\n|\n/);

                                    // convert single lines to items in pixels matrix
                                    for (let i = 1; i < allLines2.length; i++) {
                                        let items = allLines2[i].split(',');
                                        if (items.length >= LENGTH) {
                                            processPixel(...items);
                                        }
                                    }

                                    // sort each pixel's updates on timestamp
                                    pixels.forEach(x => x.forEach(y => y.sort((a, b) => a.timestamp - b.timestamp)));

                                    console.log("Pixels part 2 processed!");

                                    pixelsLoaded();
                                }
                            }
                        }
                        xhr2.send();
                    }

                    // process part 1
                    console.log("Processing pixels part 1...");

                    // parse response
                    let allText = xhr.responseText;
                    let allLines = allText.split(/\r\n|\n/);

                    // convert single lines to items in pixels matrix
                    for (let i = 1; i < allLines.length; i++) {
                        let items = allLines[i].split(',');
                        if (items.length >= LENGTH) {
                            processPixel(...items);
                        }
                    }

                    // sort each pixel's updates on timestamp
                    pixels.forEach(x => x.forEach(y => y.sort((a, b) => a.timestamp - b.timestamp)));

                    console.log("Pixels processed!");

                    pixelsLoaded();
                }
            }
        }
        xhr.send();
    }
}

function processPixel(timestamp = "", user_id = "", pixel_color = "", ...coordinates) {
    // prepare the data for the pixel
    timestamp = timestamp.split(' ');   // [ YYYY-mm-DD, HH:MM:SS.sss, UTC ]
    let date = timestamp[0].split('-'); // [ YYYY, mm, DD ]
    let time = timestamp[1].split(':'); // [ HH, MM, SS.sss ]
    let s = time[2].split('.');         // [ SS, sss ]
    let d = new Date(date[0], date[1] - 1, date[2], time[0], time[1], ...s);

    let pixel = {
        timestamp: d.getTime(),
        user_id,
        pixel_color
    };

    // prepare the coordintes for the pixel (or rectangle)
    if (coordinates.length === 4) {
        /*
         * Inside the dataset there are instances of moderators using a rectangle drawing tool to handle inappropriate content.
         * These rows differ in the coordinate tuple which contain four values instead of two–“x1,y1,x2,y2” corresponding to
         * the upper left x1, y1 coordinate and the lower right x2, y2 coordinate of the moderation rect.
         * These events apply the specified color to all tiles within those two points, inclusive.
         */
        let x1 = +coordinates[0].replace('"', '');
        let y1 = +coordinates[1];
        let x2 = +coordinates[2];
        let y2 = +coordinates[3].replace('"', '');

        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                pixels[x][y].push(pixel);
            }
        }
    } else {
        // normal pixel placement
        let x = +coordinates[0].replace('"', '');
        let y = +coordinates[1].replace('"', '');

        pixels[x][y].push(pixel);
    }
}
