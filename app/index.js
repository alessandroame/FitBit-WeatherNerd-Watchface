import document from "document";
import { memory } from "system";
import { display } from "display";
import * as settings from "./settings";


function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc}`;
    console.log(msg);
    return msg;
}

memStats("start");
import * as clock from "./clock"
import * as connection from "./connection"
import * as settings from "./settings"
//import * as battery from "./battery"
import * as meteo from "./meteo"
import * as meteo_alerts from "./meteo_alerts"
//import * as touch_areas from "./touch_areas"
import * as log_viewer from "./log_viewer"
import * as logger from "./logger"
import * as mediator from "../common/mediator"
import { vibration } from "haptics"
import * as ping from "./ping"
import * as forecasts from "./forecasts"
import * as sunDial from './sun_dial'
import * as fitWidget from "./fit_widget"
import * as weatherWidget from "./weather_widget"

//setInterval( memStats, 3000);
// setInterval( ping.ping, 60000);

memStats("after imports");

clock.init();
connection.init();
settings.init();
//battery.init();
forecasts.init(showClock);
meteo_alerts.init();
fitWidget.init();
meteo.init(onMeteoDataAvailable);
/*touch_areas.init(() => {
    logger.info("meteo requested");
    mediator.publish("requestGetCurrentPosition", null);
    vibration.start("bump");
    meteo_alerts.test();
}, log_viewer.showLogger, showWeather, fitWidget.prev, fitWidget.next);
*/

document.getElementById("btTouch").onclick=()=>{
    log_viewer.showLogger();
}

document.getElementById("datumTouch").onclick=()=>{
    logger.info("meteo requested");
    mediator.publish("requestGetCurrentPosition", null);
    vibration.start("bump");
    meteo_alerts.test();
}
showClock();

// settings.subscribe("datumDayColor", (color) => {
//     document.getElementById("fitWidget").getElementById("value").style.fill = color;
//     document.getElementById("currentWeather").getElementById("temp").style.fill = color;
//     document.getElementById("clockDialHours").style.fill = color;
//     document.getElementById("secs").style.fill = color;
//     document.getElementById("dayNumber").style.fill = color;
// }, "white");

function onMeteoDataAvailable(data) {
    //logger.warning(memStats("onMeteoDataAvailable"));
    meteo_alerts.update(data.alerts);

    forecasts.setData(data);
    weatherWidget.update(data);

    let sr = new Date(data.sunrise);
    let ss = new Date(data.sunset);
    // console.log(ss,sr);
    sunDial.update(sr, ss);

    //logger.warning(memStats("end Meteo"));

    //setTimeout(()=>{     logger.warning(memStats("after Meteo"));}, 5000);
}

function showClock() {
    clock.show();
    forecasts.hide();
}

// if (display.aodAvailable /*&& appbit.permissions.granted("access_aod")*/) {
//     // tell the system we support AOD
//     display.aodAllowed = true;

//     // respond to display change events
//     display.addEventListener("change", () => {
//         if (!display.aodActive && display.on) {
//             setAOD(false);
//         } else {
//             setAOD(true);
//         }
//     });
// }

function setAOD(enabled) {
    let elements = ["dialGraphic", "secs", "secsShadow", 
    "currentWeather", "fitWidget", "clockDialMinutes", "clockDialHours","datum",
    "alerts","connectionWidget",
    //"batteryWidget",
    "sunsetHand","sunriseHand","minsShadow","hoursShadow"];
    console.warn("AOD: " + enabled);
    let display = enabled ? "none" : "inline";
    for (let i = 0; i < elements.length; i++) {
        document.getElementById(elements[i]).style.display = display;
    }
}

function showMenu() {
    logger.info("meteo requested");
    mediator.publish("requestGetCurrentPosition", null);
    vibration.start("bump");
    /*document.location.assign("menu.view").then(() => {
        console.log("menu.view");
        document.getElementById("menu1").addEventListener("click", (evt) => {
            console.log("menu1 clicked");
            messaging.publish("requestMeteoUpdate", null);
            document.history.back();
        });

        document.getElementById("menu2").addEventListener("click", (evt) => {
            console.log("menu2 clicked");
            document.history.back();
            log_viewer.showLogger();
        });
    });*/
}
document.getElementById("weatherWidgetTouch").onclick=function(){
    forecasts.show();
    clock.hide();
    startClockDispayTimeout();
}

function showFitdata() {
    vibration.start("bump");
    mediator.publish("requestGetCurrentPosition");
    mediator.publish("requestMeteoUpdate", null);
}


let clockDisplayTimeout = null;
function startClockDispayTimeout() {
    if (clockDisplayTimeout) {
        clearTimeout(clockDisplayTimeout);
        clockDisplayTimeout = null;
    }
    clockDisplayTimeout = setTimeout(() => {
        showClock();
    }, 10000);
}


memStats("app started");
