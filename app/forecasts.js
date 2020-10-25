import document from "document";
import * as geom from './geom';

let hourlyForecastsUI = null;
export function init(closeCallback) {
    console.log("forecast init")
    hourlyForecastsUI = document.getElementById("hourlyForecasts");
    var touch = document.getElementById("touch");
    touch.layer=999;
    touch.onclick = closeCallback;
    for (var i = 0; i < 12; i++) {
        try {
            var f = document.getElementById("forecast_" + i);
            var mainContainer = f.getElementById("mainContainer");
            var iconContainer = mainContainer.getElementById("iconContainer");
            var tempContainer = mainContainer.getElementById("tempContainer");
            var angle=i * 30;
            mainContainer.groupTransform.rotate.angle = angle;
            iconContainer.groupTransform.rotate.angle = -angle;
            tempContainer.groupTransform.rotate.angle = -angle;
        } catch (e) {
            console.error("initForecastView fails:" + e);
            console.trace();
        }
    }
    if (meteo) redraw();
}

export function show() {
    hourlyForecastsUI.style.display = "inline";
}

export function hide() {
    hourlyForecastsUI.style.display = "none";
}


let meteo = null;
export function setData(data) {
    meteo = data;
    console.log(JSON.stringify(data));
    redraw();
}

function redraw() {
    try {
        let location=meteo.city;
        if (location.length>15) location=`${location.substr(0,14)}...`;
        document.getElementById("location").textContent = location;
        document.getElementById("lastUpdate").textContent = meteo.lastUpdate;
        let forecasts = meteo.forecasts;
        let d = new Date().getHours();
        if (d > 11) d = d - 12;
        for (var i = 0; i < 12; i++) {
            var f = document.getElementById("forecast_" + i);
            var mainContainer = f.getElementById("mainContainer");


            let dist = i >= d ? i - d : i + 12 - d;
            let o = 0.2 + 0.8 / 12 * (12 - dist);
            mainContainer.style.opacity = o;

            //var iconContainer = mainContainer.getElementById("iconContainer");
            var icon = mainContainer.getElementById("icon");
            icon.href = "icons/meteo/" + forecasts[i].icon + ".png";
            var temp = mainContainer.getElementById("temp");
            temp.textContent = parseTemp(forecasts[i].temp) + forecasts[i].tempUnits;
        }

        let sr = new Date(meteo.sunrise);
        let ss = new Date(meteo.sunset);
        // document.getElementById("sunriseHand").groupTransform.rotate.angle = geom.hoursToAngle(sr.getHours(),sr.getMinutes());
        // document.getElementById("sunsetHand").groupTransform.rotate.angle = geom.hoursToAngle(ss.getHours(), ss.getMinutes());
    } catch (e) {
        console.error(e);
    }
}
function parseTemp(v) {
    if (v < 0 && v > -1) v = 0;
    return v.toFixed(0);
}
