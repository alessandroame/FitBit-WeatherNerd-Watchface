import { memory } from "system";
import document from "document";
function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc}`;
    console.log(msg);
}

memStats("start");
import * as clock from "./clock"
import * as datum from "./datum"
import * as connectionWidget from "./connection_widget"
import * as settings from "./settings"
import * as battery from "./battery"
import * as meteo from "./meteo"
import * as meteo_alerts from "./meteo_alerts"
import * as touch_areas from "./touch_areas"
import * as log_viewer from "./log_viewer"
import * as logger from "../common/logger"
import * as messaging from "../common/message_mediator";

memStats("after imports");

setInterval(() => {
    memStats();
}, 30000);

datum.init();

clock.init();
connectionWidget.init();
settings.init();
battery.init();
meteo_alerts.init();
meteo.init(meteo_alerts.update);

touch_areas.init(showClockData, showMenu, log_viewer.showLogger, showWeather, showFitdata);

function showClockData() {
    datum.highlight();
}

function showMenu() {
    messaging.publish("requestMeteoUpdate", null);
/*    document.location.assign("menu.view").then(() => {
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

function showWeather(){}
function showFitdata(){}
settings.subscribe("lastMeteoUpdate", (value) => {
    logger.info("lastUpdate "+value);
    document.getElementById("lastUpdate").textContent = value;
});

memStats("app started");
