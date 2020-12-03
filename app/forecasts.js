import document from "document";
import * as geom from './geom';
import * as settings from "./settings"

settings.subscribe("clockBackgroundColor", (color) => {
    document.getElementById("forecastBackground").gradient.colors.c1 = color;
}, "#333333");

let hourlyForecastsUI = null;
export function init(closeCallback) {
    console.log("forecast init")
    hourlyForecastsUI = document.getElementById("hourlyForecasts");
    var touch = document.getElementById("touch");
    touch.layer = 999;
    touch.onclick = closeCallback;
    for (var i = 0; i < 12; i++) {
        try {
            var f = document.getElementById("forecast_" + i);
            var mainContainer = f.getElementById("mainContainer");
            var iconContainer = mainContainer.getElementById("iconContainer");
            var tempContainer = mainContainer.getElementById("tempContainer");
            var angle = i * 30;
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
    //console.error(new Date());
    //console.error(meteo.lastUpdate);
    var diff=new Date()-meteo.lastUpdate;
    var h=Math.floor(diff/3600000);
    var m=Math.floor(diff/60000);
    var s=Math.floor(diff/1000);
    let msg="";
    if (h>1){
        msg+=h+" hour"+(m==1?"":"s")+" "+m+" minute"+(m==1?"":"s")+" ago";
    }if (m>0){
        msg+=m+" minute"+(m==1?"":"s")+" ago";
    }else{
        msg+=s+" second"+(s==1?"":"s")+" ago";
    }

    document.getElementById("lastUpdate").textContent = msg;
    //document.getElementById("lastUpdate").textContent = zeroPad(meteo.lastUpdate.getHours()) + ":" + zeroPad(meteo.lastUpdate.getMinutes());

    hourlyForecastsUI.style.display = "inline";
}

export function hide() {
    hourlyForecastsUI.style.display = "none";
}


let meteo = null;
export function setData(data) {
    meteo = data;
    redraw();
}

function zeroPad(s) {
    let res=s+"";
    if (res.length < 2) res = "0" + res;
    return res;
}

function ellipsis(s,l){
    if (s.length>l) s=s.substr(0,l-3)+"...";
    return s;
}

function redraw() {
    try {
        document.getElementById("location_main").textContent = ellipsis(meteo.city.main,16);
        document.getElementById("location_sub").textContent = ellipsis(meteo.city.sub,20);

        let forecasts = meteo.forecasts;
        let d = new Date().getHours();
        if (d > 11) d = d - 12;
        for (let i = 0; i < 12; i++) {
            let f = document.getElementById("forecast_" + i);
            let mainContainer = f.getElementById("mainContainer");


            let dist = i >= d ? i - d : i + 12 - d;
            let o = 0.2 + 0.8 / 12 * (12 - dist);
            mainContainer.style.opacity = o;

            //var iconContainer = mainContainer.getElementById("iconContainer");
            let icon = mainContainer.getElementById("icon");
            icon.href = "icons/meteo/" + forecasts[i].icon + ".png";
            let temp = mainContainer.getElementById("temp");
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
    return v.toFixed();
}
