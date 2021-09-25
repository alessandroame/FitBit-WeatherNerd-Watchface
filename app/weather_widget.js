import { locale } from "user-settings";
import document from "document";
import * as settings from "./settings"

let tempUOM="C";
let speedUOM="m/s";
let value=0;
settings.subscribe("tempUOM", (value) => {
    tempUOM = value;
    updateValue();
});
settings.subscribe("speedUOM", (value) => {
    speedUOM = value;
    updateValue();
});

settings.subscribe("_aodMode",(value)=>{
    let display=value?"none":"inline";
    document.getElementById("currentWeather").getElementById("graphics").style.display=display;
});

let currentMode=null;
export function update(meteo,mode,windMode) {
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
        value=windMode=="0"?currentWeather.windSpeed:currentWeather.windGust;
    }
    updateValue();
}
function updateValue(){
    let container = document.getElementById("currentWeather");
    if (currentMode==0){
        let valueUI = container.getElementById("temp");
        valueUI.textContent = toInt(tempUOM=="C"?value:value * 9/5 + 32)+(tempUOM=="C"?"°":"F");
        container.getElementById("tempShadow").textContent = valueUI.textContent;
    }else{
        let valueUI = container.getElementById("windSpeed");
        container.getElementById("windUnits").textContent = speedUOM=="m/s"?"m/s":"kt";
        valueUI.textContent = toInt(speedUOM=="m/s"?value:value * 0.621371);
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

