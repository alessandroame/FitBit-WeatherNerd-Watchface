
import { memory } from "system";
import document from "document";
logMem("start");
import * as clock from "./clock"
import * as datum from "./datum"
import * as connectionWidget from "./connection_widget"
import * as settings from "./settings"
import * as battery from "./battery"
import * as meteo from "./meteo"
import * as meteo_alerts from "./meteo_alerts"
import * as touch_areas from "./touch_areas"
import * as messaging from "../common/message_mediator";

logMem("after imports");

datum.init();

clock.init();
connectionWidget.init();
settings.init();
battery.init();
meteo_alerts.init();
meteo.init(meteo_alerts.update);
touch_areas.init(
    () => {
        console.log("touched Center");
        datum.highlight();
    },
    () => {
        console.log("touched TL");
        showMenu();
    },
    () => {
        console.log("touched TR");
    },
    () => {
        console.log("touched BL");
    },
    () => {
        console.log("touched BR");
    }
);

function showMenu() {
    document.location.assign("menu.view").then(() => {
        console.log("menu.view");
        document.getElementById("menu1").addEventListener("click", (evt) => {
            console.log("menu1 clicked");
            messaging.publish("forceUpdate",null);
            document.history.back();
        });
    });
}


console.log("App started");
logMem("started");

function logMem(desc) {
    console.log("MEM " + (memory.js.used / memory.js.total * 100).toFixed(1) + "% " + desc);
}

settings.subscribe("lastMeteoUpdate", (value) => {
    document.getElementById("lastUpdate").textContent = value;
});