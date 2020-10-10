import { geolocation } from "geolocation";
import * as logger  from "./logger";

let positionChangedCallback = null;

export function init(onPositionChangedCallback) {
    console.log("geolocator init");
    positionChangedCallback = onPositionChangedCallback;
    //getCurrentPosition();
}


//TODO REMOVE 
setInterval(getCurrentPosition, 120000);
export function getCurrentPosition() {
    geolocation.getCurrentPosition(onLocationSuccess, onLocationError, { timeout: 20 * 1000 });
}

function onLocationSuccess(position) {
    if (positionChangedCallback) {
        console.log("geolocator position changed")
        positionChangedCallback(position);
    }
}

function onLocationError(error) {
    logger.error("onLocationError: " + error.code + "Message: " + error.message);
}
