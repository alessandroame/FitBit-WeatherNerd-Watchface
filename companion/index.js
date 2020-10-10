import { me } from "companion";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as mediator from "../common/mediator";
import * as settings from "./settings";
import * as climacell from "./climacell";
import * as geolocator from "./geolocator";
import * as messaging from "messaging";


let wakeInterval = 5 * 60 * 1000;
let updateMeteoInterval=5;
let updateMeteoTimerID=null;
let currentPosition = null;
init();

function init() {
    settings.init();
    let now = new Date();
    let launchReasons = JSON.stringify(me.launchReasons, null, 1) + "@" + now.getHours() + ":" + now.getMinutes();
    messaging.peerSocket.addEventListener("open", () => {
        update("connection opened");
    });
    me.wakeInterval = wakeInterval;
    me.addEventListener("wakeinterval", () => {
        update("wakeinterval triggered");
    });
    
    me.monitorSignificantLocationChanges = true;
    me.addEventListener("significantlocationchange", onPositionChanged);

    climacell.init(onMeteoAvailable);
    geolocator.init(onPositionChanged);
    geolocator.getCurrentPosition();
    console.log("Companion code started");
    mediator.subscribe("requestMeteoUpdate", () => forceUpdate("requested from watch"));

    settings.subscribe("minMeteoUpdateInteval",(value)=>{
        updateMeteoInterval=Math.max(1, value*1);
        startUpdateTimer();
    },5);

    console.log("Error", "companion init");
}

function startUpdateTimer(){
    if (updateMeteoTimerID){
        console.log("updateMeteoTimer restarted ("+updateMeteoInterval+"secs)");
        clearInterval(updateMeteoTimerID);
        updateMeteoTimerID=null;
    }
    
    updateMeteoTimerID=setInterval(() => {
        update("Timer");
    },  updateMeteoInterval* 60000);//todo min value should be 5
}


function onPositionChanged(position) {
    console.log("geolocator positionChanged: " + JSON.stringify(position));
    currentPosition = position;
    //update("position changed");
    climacell.setPosition(currentPosition);
}

function update(reason) {
    throttle(() => {
        forceUpdate(reason);
    }, updateMeteoInterval * 6000,"update "+reason);
}

function forceUpdate(reason){
    climacell.setPosition(currentPosition);
    //geolocator.getCurrentPosition();
    console.info("update meteo->" + reason);
    mediator.publish("Error", "update->" + reason);
}

function onMeteoAvailable(data) {
    //console.log("onMeteoAvailable " + JSON.stringify(data));
    mediator.publish("Error", "onMeteoAvailable");
    let json = JSON.stringify(data);
    outbox
        .enqueue("meteo_data.json", encode(json)).then((ft) => {
            console.log(`onMeteoAvailable Transfer of ${ft.name} successfully queued.`);
        })
        .catch((error) => {
            let msg = `onMeteoAvailable Failed to queue ${fn}: ${error}`;
            console.error(msg);
            mediator.publish("Error", {
                code: 4,
                msg: msg
            });
        });
}


let throttleTimers = {};
function throttle(func, delay,msg) {
    if (throttleTimers[func]) { console.log("throttled "+msg); return; }
    throttleTimers[func] = setTimeout(() => { throttleTimers[func] = null; func(); }, delay);
}
