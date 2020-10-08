import { me } from "companion";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as mediator from "../common/mediator";
import { settingsStorage } from "settings";
import * as settingsStorageMediator from "./settingsStorageMediator";
import * as climacell from "./climacell";
import * as geolocator from "./geolocator";
import * as messaging from "messaging";

let wakeInterval = 5 * 60 * 1000;
let currentPosition = null;
init();

function init() {
    let now = new Date();
    let launchReasons = JSON.stringify(me.launchReasons, null, 1) + "@" + now.getHours() + ":" + now.getMinutes();
    messaging.peerSocket.addEventListener("open", () => {
        update("connection opened");//launchReasons);
    });
    me.wakeInterval = wakeInterval;
    me.addEventListener("wakeinterval", () => {
        update("wakeinterval triggered");
    });
    let updateMeteoTimerID=null;
    mediator.subscribe("setting",(data)=>{
        if (updateMeteoTimerID){
            console.log("updateMeteoTimer restarted");
            clearInterval(updateMeteoTimerID);
            updateMeteoTimerID=null;
        }
        updateMeteoTimerID=setInterval(() => {
            update("Timer");
        }, Math.max(1, data.value) * 60000);//todo min value should be 5
    });   


    me.monitorSignificantLocationChanges = true;
    me.addEventListener("significantlocationchange", onPositionChanged);

    settingsStorageMediator.init();
    climacell.init(onMeteoAvailable);
    geolocator.init(onPositionChanged);
    geolocator.getCurrentPosition();
    console.log("Companion code started");
    mediator.subscribe("requestMeteoUpdate", () => update("requested from watch"));

    
    setInterval( mediator.ping, 60000);
}

function onPositionChanged(position) {
    console.log("geolocator positionChanged: " + JSON.stringify(position));
    currentPosition = position;
    update("position changed");
}

function update(reason) {
    throttle(() => {
        climacell.setPosition(currentPosition);
        mediator.publish("Error", "update->" + reason);
    }, settingsStorage.getItem("minMeteoUpdateInteval", 5) * 6000);
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
function throttle(func, delay) {
    if (throttleTimers[func]) { console.log("throttled"); return; }
    throttleTimers[func] = setTimeout(() => { throttleTimers[func] = null; func(); }, delay);
}
