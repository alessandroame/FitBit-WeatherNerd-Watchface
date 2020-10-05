import document from "document";
import * as logger from "../common/logger";
import { battery } from "power";
import * as settings from "./settings"

let widget = document.getElementById("battery");
let touch = document.getElementById("batteryTouch");
let rail = widget.getElementById("rail");
let level = widget.getElementById("level");

let COLOR_NORMAL = "gray";
settings.subscribe("batteryColor",(value)=>{
    if (!value) value="gray";
    COLOR_NORMAL=value;
    setBatteryLevel(battery.chargeLevel);
});

const COLOR_WARNING = "yellow";
const COLOR_ALERT = "red";

export function init() {
    logger.debug("Battery init");
    battery.onchange = (charger, evt) => {
        //logger.debug("battery.onchange")
        setBatteryLevel(battery.chargeLevel);
    };
    setBatteryLevel(battery.chargeLevel);
}

function setBatteryLevel(batteryLevel) {
    //logger.debug("updateBattery");
    widget.style.opacity=1;
    let color = COLOR_NORMAL;
    if (batteryLevel < 15) {
        color = COLOR_ALERT
    }
    else if (batteryLevel < 30) {
        color = COLOR_WARNING;
    }
    level.style.fill = color;
    level.sweepAngle = -(30 / 100 * batteryLevel);
    rail.style.fill = color;
}

