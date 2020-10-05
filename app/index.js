
import { memory } from "system";
import document from "document";
import * as logger from "../common/logger";
function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc}`;
    logger.info(msg);
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
import * as messaging from "../common/message_mediator";

memStats("after imports");

setInterval(() => {
    memStats();
}, 30000);
showClock();

function showClock() {
    datum.init();

    clock.init();
    connectionWidget.init();
    settings.init();
    battery.init();
    meteo_alerts.init();
    meteo.init(meteo_alerts.update);

    touch_areas.init(
        () => {
            logger.debug("touched Center");
            datum.highlight();
        },
        () => {
            logger.debug("touched TL");
            showMenu();
        },
        () => {
            logger.debug("touched TR");
            log_viewer.showLogger();
        },
        () => {
            logger.debug("touched BL");
        },
        () => {
            logger.debug("touched BR");
        }
    );
}

function showMenu() {
    document.location.assign("menu.view").then(() => {
        logger.debug("menu.view");
        
        document.getElementById("menu1").addEventListener("click", (evt) => {
            logger.debug("menu1 clicked");
            messaging.publish("forceUpdate", null);
            document.history.back();
            showClock();
        });

        document.getElementById("menu2").addEventListener("click", (evt) => {
            logger.debug("menu2 clicked");
            document.history.back();
            log_viewer.showLogger();
        });
    });
}

settings.subscribe("lastMeteoUpdate", (value) => {
    document.getElementById("lastUpdate").textContent = value;
});

memStats("app started");
