import { locale } from "user-settings";
import document from "document";
import * as settings from "./settings"

let unitSystem="si";
let value=0;
settings.subscribe("unitSystem", (value) => {
    unitSystem = value;
    updateValue();
}, locale.temperature == "C" ? "si" : "us");

let currentMode=null;
export function update(meteo,mode) {
    currentMode=mode;
    let index = Math.floor(new Date().getHours());
    if (index > 11) index -= 12;
    let currentWeather = meteo.forecasts[index];
    //    console.error(JSON.stringify(currentWeather));
    let container = document.getElementById("currentWeather");
    let icon = container.getElementById("icon");
    let windSpeed = container.getElementById("windSpeed");
    let weatherContainer = container.getElementById("weatherContainer");
    let windContainer = container.getElementById("windContainer");
    
    weatherContainer.style.display=mode==0?"inline":"none";
    windContainer.style.display=mode!=0?"inline":"none";

    if (mode==0){
        icon.href = "icons/meteo/" + currentWeather.icon + ".png";
        value=currentWeather.temp;
    }else{
        windContainer.getElementById("direction").groupTransform.rotate.angle = currentWeather.windDirection;
        value=currentWeather.windSpeed;
    }
    updateValue();
}
function updateValue(){
    let container = document.getElementById("currentWeather");
    if (currentMode==0){
        let valueUI = container.getElementById("temp");
        console.log(toInt(unitSystem=="si"?value:value * 9/5 + 32));
        valueUI.textContent = toInt(unitSystem=="si"?value:value * 9/5 + 32)+(unitSystem=="si"?"°":"F");
        container.getElementById("tempShadow").textContent = valueUI.textContent;
    }else{
        let valueUI = container.getElementById("windSpeed");
        container.getElementById("windUnits").textContent = unitSystem=="si"?"km/h":"mph";
        valueUI.textContent = toInt(value);
        container.getElementById("windSpeedShadow").textContent = valueUI.textContent;
    }
}
function toInt(v) {//TODO use floor?
    if (v < 0 && v > -1) v = 0;
    return v.toFixed();
}
settings.subscribe("weatherWidgetColor", (color) => {
    document.getElementById("currentWeather").getElementById("temp").style.fill = color;
    document.getElementById("currentWeather").getElementById("windSpeed").style.fill = color;
}, "white");
settings.subscribe("weatherBackgroundColor", (color) => {
    document.getElementById("currentWeather").getElementById("background").style.fill = color;
}, "gray");

