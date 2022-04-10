let pixels = [[{ "timestamp": "", "user_id": "", "pixel_color": "" }]];

///////////* WITH IMAGES FROM SITE *///////////
const BASE_URL = "https://rplace.space/combined/";

let data = [{ "file": "", "date": "", "size": 0 }];
let cooldown;
let onCooldown = false;

function loadData() {
    // load json file
    let xhr = new XMLHttpRequest();
    if (xhr !== null) {
        xhr.open("GET", "../index-combined.json");
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
