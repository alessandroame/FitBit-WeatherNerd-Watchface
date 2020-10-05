import { me } from "companion";
import * as logger from "../common/logger";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as settingsStorageMediator from "./settingsStorageMediator";
import * as climacell from "./climacell";
import * as geolocator from "./geolocator";

let wakeInterval= 5*60*1000; 
me.wakeInterval = wakeInterval;
me.monitorSignificantLocationChanges = true;

logger.debug("Companion launchReason: "+JSON.stringify(me.launchReasons));

settingsStorageMediator.init();
climacell.init(onMeteoAvailable);
geolocator.init(onPositionChanged);
logger.debug("Companion code started");

let currentPosition=null;

function onPositionChanged(position){
    logger.debug("geolocator positionChanged: " + JSON.stringify(position));
    currentPosition=position;
    climacell.setPosition(currentPosition);
}

function onMeteoAvailable(data) {
    //logger.debug("onMeteoAvailable " + JSON.stringify(data));
    let json = JSON.stringify(data);
    outbox.enqueue("meteo_data.json", encode(json)).then((ft) => {
        logger.debug(`onMeteoAvailable Transfer of ${ft.name} successfully queued.`);
    })
    .catch((error) => {
        logger.error(`onMeteoAvailable Failed to queue ${fn}: ${error}`);
    });
}