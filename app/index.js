import * as logger from "./logger"
import { memory } from "system";

function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc??""} ${(memory.js.used/1000).toFixed(0)}KB / ${(memory.js.total/1000).toFixed(0)}KB ${memory.monitor.pressure}`;
    logger.debug(msg);
    return msg;
}
memory.monitor.onmemorypressurechange=()=>{
    var msg=`Mem is ${memory.monitor.pressure} ${(memory.js.used / memory.js.total * 100).toFixed(1)}%`;
    switch (memory.monitor.pressure){
        case "normal": logger.info(msg); break;
        case "high": logger.warning(msg); break;
        case "critical": logger.error(msg); break;
    }
}
memStats("start");
//setInterval( memStats, 1000);

import { me as appbit } from "appbit";
import document from "document";
import { display } from "display";
import * as clock from "./clock"
import * as connection from "./connection"
import * as settings from "./settings"
import * as meteo from "./meteo"
import * as meteo_alerts from "./meteo_alerts"
import * as log_viewer from "./log_viewer"
import * as mediator from "../common/mediator"
import { vibration } from "haptics"
import * as ping from "./ping"
import * as forecasts from "./forecasts"
import * as sunDial from './sun_dial'
import * as fitWidget from "./fit_widget"
import * as weatherWidget from "./weather_widget"

// setInterval( ping.ping, 60000);

memStats("after imports");

settings.init();
clock.init();
connection.init();
forecasts.init(showClock);
meteo_alerts.init();
fitWidget.init();
meteo.init(onMeteoDataAvailable);

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
    try{
        meteo_alerts.update(data.alerts,data.nextHourProbabilities,mode);
    }catch(e){
        logger.error("alerts.update throws"+e);
        throw e;
    }

    try{
        forecasts.setData(data,mode,windMode);
    }catch(e){
        logger.error("forecasts.setData throws"+e);
        throw e;
    }

    try{
        weatherWidget.update(data,mode,windMode);
    }catch(e){
        logger.error("weatherWidget.update throws"+e);
        throw e;
    }
    
    try{
        let sr = new Date(data.sunrise);
        let ss = new Date(data.sunset);
        // console.log(ss,sr);
        sunDial.update(sr, ss);
    }catch(e){
        logger.error("sunDial.update throws"+e);
        throw e;
    }
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
