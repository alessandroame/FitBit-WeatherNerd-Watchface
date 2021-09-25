import { me as appbit } from "appbit";
import document from "document";
import { memory } from "system";
import { display } from "display";
import * as settings from "./settings";


function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc}`;
    logger.debug(msg);
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
import { display } from "display";
//setInterval( memStats, 3000);
// setInterval( ping.ping, 60000);

memStats("after imports");

settings.init();
clock.init();
connection.init();
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
settings.subscribe("automaticBackgroundColor",()=>{
    meteo.fetchMeteo();
},0);
settings.subscribe("meteoMode",(mode)=>{
    //document.getElementById("wind_mode").style.display=mode==0?"none":"inline";
    document.getElementById("meteo_mode").style.fill="#BBBBBB";
    document.getElementById("meteo_mode").href="icons/"+(mode==0?"precip":"wind")+"ModeBtn.png";
    document.getElementById("wind_mode").style.fill=mode==1?"#BBBBBB":"#555555";
    meteo.fetchMeteo();
},0);
document.getElementById("meteo_mode_button").onclick=()=>{
    let mode=settings.get("meteoMode",0);
    if (mode==0) mode=1;
    else mode=0;
    settings.set("meteoMode",mode);
};

settings.subscribe("windMode",(mode)=>{
    document.getElementById("wind_mode").href="icons/wind"+(mode==0?"Speed":"Gust")+"Btn.png";
    meteo.fetchMeteo();
},0);
document.getElementById("wind_mode_button").onclick=()=>{
//    if (settings.get("meteoMode",0)==0) return;
    let mode=settings.get("windMode",0);
    if (mode==0) mode=1;
    else mode=0;
    settings.set("windMode",mode);
};

document.getElementById("display_mode_button").addEventListener("mousedown", (evt) => {
    clock.setRest();
});

document.getElementById("display_mode_button").addEventListener("mouseup", (evt) => {
    clock.resetRest();
});

showClock();

function onMeteoDataAvailable(data,mode,windMode) {
    //logger.warning(memStats("onMeteoDataAvailable"));
    meteo_alerts.update(data.alerts,data.nextHourProbabilities,mode);

    forecasts.setData(data,mode,windMode);
    weatherWidget.update(data,mode,windMode);

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

settings.set("_aodMode",false);
if (display.aodAvailable && appbit.permissions.granted("access_aod")) {
    display.aodAllowed = true;
    logger.warning("aod permissions granted");
    display.addEventListener("change", () => {
        if (!display.aodActive && display.on) {
            logger.warning("Display on mode");
            settings.set("_aodMode",false);
        } else {
            settings.set("_aodMode",true);
            logger.warning("Display AOD mode");
        }
    });
}else{
    logger.error("aod permissions NOT granted");
}

settings.subscribe("_aodMode",(value)=>{
    let display=value?"none":"inline";
    document.getElementById("buttons").style.display=display;
    meteo.fetchMeteo();

});
  
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
    }, 20000);
}


memStats("app started");
