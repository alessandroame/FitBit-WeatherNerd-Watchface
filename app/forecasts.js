import { locale } from "user-settings";
import * as settings from "./settings";
import * as logger from "./logger"
import document from "document";

let unitSystem = "si";
let hourlyForecastsUI = null;
let meteo = null;
let lastMode=0;

/*settings.subscribe("clockBackgroundColor", (color) => {
    document.getElementById("forecastBackground").gradient.colors.c1 = color;
}, "#333333");*/
settings.subscribe("unitSystem", (value) => {
    unitSystem = value;
    redraw(lastMode);
}, locale.temperature == "C" ? "si" : "us");

export function init(closeCallback) {
    console.log("forecast init")
    hourlyForecastsUI = document.getElementById("hourlyForecasts");
    let touch = document.getElementById("touch");
    touch.layer = 999;
    touch.onclick = closeCallback;
    for (let i = 0; i < 12; i++) {
        try {
            let f = document.getElementById("forecast_" + i);
            let mainContainer = f.getElementById("mainContainer");
            let iconContainer = mainContainer.getElementById("iconContainer");
            let tempContainer = mainContainer.getElementById("tempContainer");
            let angle = i * 30;
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
    if (meteo?.lastUpdate) {
        let now=new Date();
        let diff = now - meteo.lastUpdate;
        let h = Math.floor(diff / 3600000);
        let m = Math.floor((diff-h*3600000) / 60000);
        let s = Math.floor((diff-h*3600000-m*60000) / 1000);
        //console.log(h,m,s);
        let msg = "";
        if (h >= 1) {
            msg += h + " hour" + (m == 1 ? "" : "s");
            if (m>0){
                 msg+= " " + m + " min" + (m == 1 ? "" : "s")
            }
            msg+=  " ago";
        }else if (m > 0) {
            msg += m + " min" + (m == 1 ? "" : "s") + " ago";
        } else {
            msg += s + " sec" + (s == 1 ? "" : "s") + " ago";
        }
    }else{
        msg="You need a valid apikey.";
    }
    document.getElementById("lastUpdate").textContent = msg;
    //document.getElementById("lastUpdate").textContent = zeroPad(meteo.lastUpdate.getHours()) + ":" + zeroPad(meteo.lastUpdate.getMinutes());
    hourlyForecastsUI.style.display = "inline";
}

export function hide() {
    hourlyForecastsUI.style.display = "none";
}


export function setData(data,mode) {
    meteo = data;
    redraw(mode);
}

function zeroPad(s) {
    let res = s + "";
    if (res.length < 2) res = "0" + res;
    return res;
}

function ellipsis(s, l) {
    if (s.length > l) s = s.substr(0, l - 3) + "...";
    return s;
}
function redraw(mode) {
    try {
        lastMode=mode;
        if (meteo==null) return;
        let title=mode==0?"TEMP":"WIND";
        let units=mode==0?(unitSystem == "si"?"°":"F"):(unitSystem == "si"?"m/s":"kn");
        document.getElementById("title").textContent = title+"("+units+")";
        //document.getElementById("title").style.fill = mode==0?"red":"#006ED6";
        let forecasts = meteo.forecasts;
        let d = new Date().getHours();
        if (d > 11) d = d - 12;
        let min=9999;
        let max=-9999;
        for (let i = 0; i < 12; i++) {
            try{
                let value=null;
                let f = document.getElementById("forecast_" + i);
                let mainContainer = f.getElementById("mainContainer");

                let dist = i >= d ? i - d : i + 12 - d;
                let o = 0.2 + 0.8 / 12 * (12 - dist);
                mainContainer.style.opacity = o;
                let iconContainer = mainContainer.getElementById("iconContainer");
                let icon = mainContainer.getElementById("icon");
                let temp = mainContainer.getElementById("temp");
                if (mode==0){
                    iconContainer.groupTransform.rotate.angle = -i*30;
                    icon.href = "icons/meteo/" + forecasts[i].icon + ".png";
                    value = forecasts[i].temp;
                    if (unitSystem != "si") {
                        value = value * 9 / 5 + 32;
                    }
                }else{
    //                console.warn(forecasts[i].windDirection);
                    iconContainer.groupTransform.rotate.angle = forecasts[i].windDirection-i*30;
                    icon.style.fill="#006ED6";
                    icon.href = "icons/windDirection.png";
                    value = forecasts[i].windSpeed;
                    if (unitSystem != "si") {
                        value = value * 2;
                    }
                }
                temp.textContent = toInt(value);
                min=Math.min(min,value);
                max=Math.max(max,value);
            } catch (e) {
                logger.error("Redraw ["+i+"] throws: "+e);
            }
        }
        hourlyForecastsUI.getElementById("minValue").textContent=toInt(min);
        hourlyForecastsUI.getElementById("maxValue").textContent=toInt(max);
    } catch (e) {
        logger.error("Redraw throws: "+e);
    }
}
function toInt(v) {
    if (v===undefined) v = 0;
    return Math.floor(v);
}
