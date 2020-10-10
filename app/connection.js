import document from "document";
import { vibration } from "haptics";
import * as settings from "./settings"
import * as mediator from "../common/mediator";
import * as logger from "./logger";

const COLOR_NORMAL = "#006ED6";
const COLOR_DIMMED = "gray";
const COLOR_ERROR = "red";
let color = COLOR_NORMAL;
let blinkingTimer = null;
let snoozeTimer = null;
let widget = document.getElementById("bt");

widget.onclick = function () {
    //    setState(state!=STATE_CONNECTED?STATE_ERROR:STATE_DISCONNECTED);
    setState(state != STATE_CONNECTED ? STATE_CONNECTED : STATE_DISCONNECTED);
}

mediator.addConnectionStateListener(onConnectionStateChange);

export function init() {
    console.log("connectionWidget init");
}

function onConnectionStateChange(state){
    
    switch (state) {
        case mediator.STATE_CONNECTED:
            logger.info("Connected");
            if (settings.get("vibrateOnConnectionLost"),true) vibration.start("nudge-max");
            color = COLOR_NORMAL;
            dismiss();
            stopBlinking();
            onConnectionOpen();
            break;
        case mediator.STATE_DISCONNECTED:
            logger.info("Disconnected");
            if (settings.get("vibrateOnConnectionLost"),true){
                vibration.start("nudge-max");
                setTimeout(()=>{vibration.start("nudge-max");},400);
            } 
            color = COLOR_NORMAL;
            startBlinking();
            onConnectionLost();
            break;
        case mediator.STATE_ERROR:
            logger.info("Connection error");
            color = COLOR_ERROR;
            startBlinking();
            onConnectionLost();
            break;
        default:
            break;
    }
}

function startBlinking() {
    if (blinkingTimer) {
        clearTimeout(blinkingTimer);
        blinkingTimer = null;
    }
    blinkingTimer = setInterval(() => {
        widget.style.fill = COLOR_DIMMED;
        setTimeout(() => { widget.style.fill = color; }, 600);
    }, 1000);
}
function stopBlinking() {
    if (blinkingTimer) {
        clearTimeout(blinkingTimer);
        blinkingTimer = null;
    }
    widget.style.fill = color;
}

function onConnectionOpen(){

}
function onConnectionLost() {
    if (!snoozeTimer) {
        if (settings.get("vibrateOnConnectionLost"),true) setTimeout(()=>{vibration.start("nudge-max");},400);
        if (settings.get("snoozeDialogEnabled"),true) showSnoozeDialog();
    }
}

function showSnoozeDialog() {
    document.location.assign("connection_dialog.view").then(() => {
        console.log(" another view loaded" + document.getElementById("btn_snooze"));
        document.getElementById("btn_snooze").addEventListener("click", (evt) => {
            console.log("btn_snooze");
            snooze();
        });
        document.getElementById("btn_dismiss").addEventListener("click", (evt) => {
            console.log("btn_dismiss");
            dismiss();
        });
    });
}

function resetSnooze() {
    if (snoozeTimer !== null) {
        console.log("resetSnooze");
        clearInterval(snoozeTimer);
        snoozeTimer = null;
    }
}
function dismiss() {
    if (!document.getElementById("btn_snooze")) return;
    resetSnooze();
    document.history.back();
};
function snooze() {
    document.history.back();
    resetSnooze();
    console.log("snoozed for " + settings.get("snoozeDelayMinutes",2)  + " minutes")
    snoozeTimer = setTimeout(function () {
        console.log("snooze timeout state: " + state);
        resetSnooze();
        if (state != STATE_CONNECTED) onConnectionLost();
    }, settings.get("snoozeDelayMinutes",2) * 60 * 1000);
}
