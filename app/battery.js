import document from "document";
import { battery } from "power";
import * as settings from "./settings"


let COLOR_NORMAL = "gray";
settings.subscribe("batteryColor",(value)=>{
    if (!value) value="gray";
    COLOR_NORMAL=value;
    setBatteryLevel(battery.chargeLevel);
});

const COLOR_WARNING = "yellow";
const COLOR_ALERT = "red";

export function init() {
    console.log("Battery init");
    battery.onchange = (charger, evt) => {
        //console.log("battery.onchange")
        setBatteryLevel(battery.chargeLevel);
    };
    setBatteryLevel(battery.chargeLevel);
}

function setBatteryLevel(batteryLevel) {
    //console.log("updateBattery");
    let level = document.getElementById("batteryLevel");
    let color = COLOR_NORMAL;
    if (batteryLevel < 15) {
        color = COLOR_ALERT
    }
    else if (batteryLevel < 30) {
        color = COLOR_WARNING;
    }
    level.style.fill = color;
    level.textContent=`${batteryLevel}%`;
    document.getElementById("frame_1").style.fill=color;
    document.getElementById("frame_2").style.fill=color;
    document.getElementById("frame_empty").width=15*(1-batteryLevel/100);
}

