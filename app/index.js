
import { memory } from "system";
import document from "document";
logMem("start");
import * as clock from "./clock"
import * as connectionWidget from "./connection_widget"
import * as settings from "./settings"
import * as battery from "./battery"
import * as meteo from "./meteo"
import * as meteo_alerts from "./meteo_alerts"

logMem("after imports");

clock.init();
connectionWidget.init();
settings.init();
battery.init();
meteo_alerts.init();
meteo.init(meteo_alerts.update);

console.log("App started");
logMem("started");

function logMem(desc) {
    console.log("MEM " + (memory.js.used / memory.js.total * 100).toFixed(1) + "% " + desc);
}

settings.subscribe("city",(value)=>{
    document.getElementById("city").textContent=value;
});