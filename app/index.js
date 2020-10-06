import { memory } from "system";
import document from "document";
function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc}`;
    console.log(msg);
}

memStats("start");
import * as clock from "./clock"
import * as datum from "./datum"
import * as connection from "./connection"
import * as settings from "./settings"
import * as battery from "./battery"
import * as meteo from "./meteo"
import * as meteo_alerts from "./meteo_alerts"
import * as touch_areas from "./touch_areas"
import * as log_viewer from "./log_viewer"
import * as logger from "../common/logger"
import * as message_mediator from "../common/message_mediator";

memStats("after imports");

setInterval(() => {
    memStats();
}, 30000);

let statusMessage=document.getElementById("statusMessage");

datum.init();
clock.init();
connection.init();
settings.init();
battery.init();
meteo_alerts.init();
meteo.init(onMeteoDataAvailable);
dimClockData();
touch_areas.init(showClockData, showMenu, log_viewer.showLogger, showWeather, showFitdata);


message_mediator.subscribe("Error",(data)=>{
    //TODO build a dialog
    logger.error(JSON.stringify(data));
});

function onMeteoDataAvailable(data){
    meteo_alerts.update(data.alerts);
    statusMessage.textContent=`${data.lastUpdate}@${data.city}`;
}

let dimmerTimer;
function showClockData() {
    datum.widget.style.opacity=1;
    statusMessage.style.opacity=1;

    if (dimmerTimer) {
        clearTimeout(dimmerTimer);
        dimmerTimer=null;
        dimClockData();
    }else{
        dimmerTimer=setTimeout(() => {  dimClockData() }, 5000);
    }
}

function dimClockData(){
    let dimmedOpacity=0.3;
    datum.widget.style.opacity=dimmedOpacity;
    statusMessage.style.opacity=dimmedOpacity;
}
function showMenu() {
    logger.info("meteo update request");
    message_mediator.publish("requestMeteoUpdate", null);

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

function showWeather(){ connection.setState(0);}
function showFitdata(){ connection.setState(1);}

memStats("app started");
