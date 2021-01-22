import { locale } from "user-settings";
import document from "document";
import * as settings from "./settings"

let unitSystem="si";
let value=0;
let unit="°";
settings.subscribe("unitSystem", (value) => {
    unitSystem = value;
    updateTemp();
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
    let iconContainer = container.getElementById("iconContainer");
 
    if (mode==0){
        icon.href = "icons/meteo/" + currentWeather.icon + ".png";
        iconContainer.groupTransform.rotate.angle = 0;
        value=currentWeather.temp;
    }else{
        icon.href = "icons/windDirection.png";
        icon.style.fill="#006ED6";
        iconContainer.groupTransform.rotate.angle = currentWeather.windDirection;
        value=currentWeather.windSpeed;
    }
    updateTemp();
}
function updateTemp(){
    let data="";
    if (currentMode==0){
        data= parseTemp(unitSystem=="si"?value:value * 9/5 + 32);
        data+=unitSystem=="si"?"°":"F";
    }else{
        data=parseTemp(value);//+"m/s";
    }

    let container = document.getElementById("currentWeather");
    let valueUI = container.getElementById("value");
    valueUI.textContent = data;
    container.getElementById("tempShadow").textContent = valueUI.textContent;
}
function parseTemp(v) {
    if (v < 0 && v > -1) v = 0;
    return v.toFixed();
}
settings.subscribe("weatherWidgetColor", (color) => {
    document.getElementById("currentWeather").getElementById("value").style.fill = color;
}, "white");
settings.subscribe("weatherBackgroundColor", (color) => {
    document.getElementById("currentWeather").getElementById("background").style.fill = color;
}, "gray");

