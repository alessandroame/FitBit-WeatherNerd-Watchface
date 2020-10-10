import { me } from "companion";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as mediator from "../common/mediator";
import * as settings from "./settings";
import * as climacell from "./climacell";
import * as geolocator from "./geolocator";
import * as messaging from "messaging";
import * as logger from "./logger";

let wakeInterval = 5 * 60 * 1000;
let updateMeteoInterval=5;
let updateMeteoTimerID=null;
let currentPosition = null;
init();

function init() {
    settings.init();  

    climacell.init(onMeteoAvailable);
    geolocator.init(onPositionChanged);

    console.log("Companion code started");
    mediator.subscribe("requestMeteoUpdate", () => forceUpdate("requested from watch"));
    mediator.subscribe("requestGetCurrentPosition", geolocator.getCurrentPosition);

    settings.subscribe("minMeteoUpdateInteval",(value)=>{
        updateMeteoInterval=Math.max(1, value*1);
        geolocator.getCurrentPosition();
        startUpdateTimer();
    },5);

    me.wakeInterval = wakeInterval;
    me.addEventListener("wakeinterval", () => {
        updateMeteo("wakeinterval triggered");
    });
    me.monitorSignificantLocationChanges = true;
    me.addEventListener("significantlocationchange", onPositionChanged);

    setInterval(()=>
    {
        console.log("ssssssssssssssssssss")
        geolocator.getCurrentPosition();
    },120000);
    
    logger.warning("companion init");
}


function startUpdateTimer(){
    if (updateMeteoTimerID){
        console.log("updateMeteoTimer restarted ("+updateMeteoInterval+"secs)");
        clearInterval(updateMeteoTimerID);
        updateMeteoTimerID=null;
    }
    
    updateMeteoTimerID=setInterval(() => {
        updateMeteo("Timer");
    },  updateMeteoInterval* 60000);//todo min value should be 5
}


function onPositionChanged(position) {
    console.log("geolocator positionChanged: " + JSON.stringify(position));
    currentPosition = position;
    settings.set("_currentPosition", JSON.stringify(position));
    updateMeteo("position changed");
}

function updateMeteo(reason) {
    throttle(() => {
        forceUpdate(reason);
    }, updateMeteoInterval * 6000,"update "+reason);
}

function forceUpdate(reason){
    climacell.update(reason);
}

function onMeteoAvailable(data) {
    logger.info("Meteo available");
    let json = JSON.stringify(data);
    outbox
        .enqueue("meteo_data.json", encode(json)).then((ft) => {
            console.log(`onMeteoAvailable Transfer of ${ft.name} successfully queued.`);
        })
        .catch((error) => {
            logger.error(`onMeteoAvailable Failed to queue ${fn}: ${error}`);
        });
}

let throttleTimers = {};
function throttle(func, delay,msg) {
    if (throttleTimers[func]) { console.log("throttled "+msg); return; }
    throttleTimers[func] = setTimeout(() => { throttleTimers[func] = null; func(); }, delay);
}
