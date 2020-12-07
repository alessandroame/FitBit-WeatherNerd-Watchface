import { locale } from "user-settings";
import document from "document";
import * as settings from "./settings"

let unitSystem="si";
let t=0;
let tu="°";
settings.subscribe("unitSystem", (value) => {
    unitSystem = value;
    updateTemp();
}, locale.temperature == "C" ? "si" : "us");

export function update(meteo) {
    let index = Math.floor(new Date().getHours());
    if (index > 11) index -= 12;
    let currentWeather = meteo.forecasts[index];
    //    console.error(JSON.stringify(currentWeather));
    let container = document.getElementById("currentWeather");
    let icon = container.getElementById("icon");
    icon.href = "icons/meteo/" + currentWeather.icon + ".png";
    t=currentWeather.temp;
    updateTemp();
}
function updateTemp(){
    tu=unitSystem=="si"?"°":"F";
    let v=unitSystem=="si"?t:t * 9/5 + 32;
    let container = document.getElementById("currentWeather");
    let temp = container.getElementById("temp");
    temp.textContent = " " + parseTemp(v) + tu;
    container.getElementById("tempShadow").textContent = temp.textContent;
}
function parseTemp(v) {
    if (v < 0 && v > -1) v = 0;
    return v.toFixed();
}
settings.subscribe("weatherWidgetColor", (color) => {
    document.getElementById("currentWeather").getElementById("temp").style.fill = color;
}, "white");
settings.subscribe("weatherBackgroundColor", (color) => {
    document.getElementById("currentWeather").getElementById("background").style.fill = color;
}, "gray");

