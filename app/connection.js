import document from "document";
import { vibration } from "haptics";
import * as settings from "./settings"
import * as mediator from "../common/mediator";
import * as logger from "./logger";
import * as ping from "./ping";

const COLOR_NORMAL = "#006ED6";
const COLOR_DIMMED = "gray";
const COLOR_ERROR = "red";
let color = COLOR_NORMAL;
let blinkingTimer = null;
let pingTimer=null;
let snoozeTimer = null;
let widget = document.getElementById("bt");


let state=mediator.STATE_CONNECTED;
widget.onclick = function () {
    //    setState(state!=STATE_CONNECTED?STATE_ERROR:STATE_DISCONNECTED);
    state=state != mediator.STATE_CONNECTED ? mediator.STATE_CONNECTED : mediator.STATE_DISCONNECTED
    onConnectionStateChange(state);
}
mediator.addConnectionStateListener(onConnectionStateChange);

export function init() {
    console.log("connectionWidget init");
}

function onConnectionStateChange(state){
    
    switch (state) {
        case mediator.STATE_CONNECTED:
            onConnectionOpen();
            break;
        case mediator.STATE_DISCONNECTED:
            onConnectionLost();
            break;
        case mediator.STATE_ERROR:
            onConnectionError();
            break;
        default:
            break;
    }
}

function onConnectionOpen(){
    logger.info("Connected");
    if (settings.get("vibrateOnConnectionLost"),true) vibration.start("nudge-max");
    color = COLOR_NORMAL;
    dismiss();
    resetInterval(blinkingTimer);
    resetInterval(pingTimer);
    widget.style.fill = color;
}

function onConnectionLost() {
    logger.info("Disconnected");
    color = COLOR_NORMAL;
    
    resetInterval(blinkingTimer);
    resetInterval(pingTimer);
    blinkingTimer = setInterval(() => {
        widget.style.fill = COLOR_DIMMED;
        setTimeout(() => { widget.style.fill = color; }, 600);
    }, 1000);
    pingTimer=setInterval(()=>{
        ping.ping();
    },5000);

    if (settings.get("vibrateOnConnectionLost",true)){
        vibration.start("nudge-max");
        setTimeout(()=>{vibration.start("nudge-max");},400);
    } 
    if (!snoozeTimer) {
        if (settings.get("vibrateOnConnectionLost",true)) setTimeout(()=>{vibration.start("nudge-max");},400);
        if (settings.get("snoozeDialogEnabled",true)) showSnoozeDialog();
    }        
}

function onConnectionError(){
    logger.error("Connection error");
    color = COLOR_ERROR;
    //TODO setConnectionLost();
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
function resetInterval(id){
    if (id) {
        clearInterval(id);
        id = null;
    }
}
function resetTimeout(id){
    if (id) {
        clearTimeout(id);
        id = null;
    }
}
