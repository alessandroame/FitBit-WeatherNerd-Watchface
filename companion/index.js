import { me } from "companion";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as message_mediator from "../common/message_mediator";
import * as settingsStorageMediator from "./settingsStorageMediator";
import * as climacell from "./climacell";
import * as geolocator from "./geolocator";


import * as messaging from "messaging";

let now=new Date();
let launchReasons=JSON.stringify(me.launchReasons,null,1)+"@"+now.getHours()+":"+now.getMinutes();
messaging.peerSocket.addEventListener("open", () => {
    message_mediator.publish("Error", launchReasons);

});



let wakeInterval= 5*60*1000; 
me.wakeInterval = wakeInterval;
me.monitorSignificantLocationChanges = true;


settingsStorageMediator.init();
climacell.init(onMeteoAvailable);
geolocator.init(onPositionChanged);
console.log("Companion code started");

let currentPosition=null;

geolocator.getCurrentPosition();
message_mediator.subscribe("requestMeteoUpdate",()=>{
    geolocator.getCurrentPosition();
});

function onPositionChanged(position){
    console.log("geolocator positionChanged: " + JSON.stringify(position));
    currentPosition=position;
    climacell.setPosition(currentPosition);
}

function onMeteoAvailable(data) {
    //console.log("onMeteoAvailable " + JSON.stringify(data));
    let json = JSON.stringify(data);
    outbox.enqueue("meteo_data.json", encode(json)).then((ft) => {
        console.log(`onMeteoAvailable Transfer of ${ft.name} successfully queued.`);
    })
    .catch((error) => {
        let msg=`onMeteoAvailable Failed to queue ${fn}: ${error}`;
        console.error(msg);
        message_mediator.publish("Error", {
            code: 4,
            msg: msg
          });
    
    });
}