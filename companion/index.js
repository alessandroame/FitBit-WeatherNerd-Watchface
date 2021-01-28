import { me } from "companion";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as mediator from "../common/mediator";
import * as settings from "./settings";
import * as climacell from "./climacell_v4";
import * as geolocator from "./geolocator";
//import * as messaging from "messaging";
import * as logger from "./logger";

let wakeInterval = 5 * 60 * 1000;
let updateMeteoInterval=5;
let updateMeteoTimerID=null;
let currentPosition = null;
init();

function init() {
    settings.init();  

    geolocator.init(onPositionChanged);

    console.log("Companion code started");
    mediator.subscribe("requestMeteoUpdate", () => forceUpdate("requested from watch"));
    mediator.subscribe("requestGetCurrentPosition", ()=> geolocator.getCurrentPosition(true));
    settings.subscribe("APIKey", (keys) => { 
        geolocator.getCurrentPosition(true); 
    });
    settings.subscribe("minMeteoUpdateInteval",(value)=>{
        updateMeteoInterval=Math.max(1, value*1);
        geolocator.getCurrentPosition();
        setTimeout(() => {
            startUpdateTimer();
        }, 1000);
    },5);

    me.wakeInterval = wakeInterval;
    me.addEventListener("wakeinterval", () => {
        updateMeteo("wakeinterval triggered");
    });
    me.monitorSignificantLocationChanges = true;
    //me.addEventListener("significantlocationchange", onPositionChanged);
    
    logger.warning("companion init");
}

function settingLog(msg){
    let log=settings.get("settingLog");
    log=msg+"\n"+log;
    settings.set("settingLog",log);
}
settingLog(new Date());
function startUpdateTimer(){
    if (updateMeteoTimerID){
        console.log("updateMeteoTimer reset");
        clearInterval(updateMeteoTimerID);
        updateMeteoTimerID=null;
    }else{
        forceUpdate("Timer init");
    }
    
    console.log("updateMeteoTimer start ("+updateMeteoInterval+"min)");
    updateMeteoTimerID=setInterval(() => {
        updateMeteo("Timer");
        geolocator.getCurrentPosition();
    },  updateMeteoInterval* 60000);//todo min value should be 5
}


function onPositionChanged(position) {
    console.log("geolocator positionChanged: " + JSON.stringify(position));
    currentPosition = position;
    if (position.coords.forceUpdate){
        forceUpdate("position changed forceUpdate");
    } 
    else {
        updateMeteo("position changed");
    }
    currentPosition.coords.forceUpdate=null;
    settings.set("_currentPosition", JSON.stringify(position));
}

function updateMeteo(reason) {
    throttle(() => {
        forceUpdate(reason);
    }, updateMeteoInterval * 60000,"update "+reason);
}

function forceUpdate(reason){
    logger.warning("udpate: "+reason);
    climacell.update(currentPosition).then(onMeteoAvailable);
}

function onMeteoAvailable(data) {
    logger.debug("meteo available");
    let json = JSON.stringify(data);
    outbox
        .enqueue("meteo_data.json", encode(json)).then((ft) => {
            console.log(`onMeteoAvailable Transfer of ${ft.name} successfully queued.`);
        })
        .catch((error) => {
            logger.error(`onMeteoAvailable Failed write file: ${error}`);
        });
}

let throttleTimer = null;
function throttle(func, delay,msg) {
    if (throttleTimer) { console.log("throttled "+msg); return; }
    throttleTimer = setTimeout(() => { throttleTimer = null; func(); }, delay);
}
