import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as settingsStorageMediator from "./settingsStorageMediator";
import * as climacell from "./climacell";
import * as geolocator from "./geolocator";

settingsStorageMediator.init();
climacell.init(onMeteoAvailable);
geolocator.init(onPositionChanged);
console.log("Companion code started");

function onPositionChanged(position){
    console.log("geolocator positionChanged: " + JSON.stringify(position));
    climacell.setPosition(position);
}

function onMeteoAvailable(data) {
    //console.log("onMeteoAvailable " + JSON.stringify(data));
    let json = JSON.stringify(data);
    outbox.enqueue("meteo_data.json", encode(json)).then((ft) => {
        console.log(`onMeteoAvailable Transfer of ${ft.name} successfully queued.`);
    })
    .catch((error) => {
        console.error(`onMeteoAvailable Failed to queue ${fn}: ${error}`);
    });
}