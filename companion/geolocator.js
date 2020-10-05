import * as logger from "../common/logger";
import { geolocation } from "geolocation";

let watchID = null;
let currentPosition = null;
let positionChangedCallback = null;

export function init(onPositionChangedCallback) {
    logger.debug("geolocator init");
    positionChangedCallback = onPositionChangedCallback;
    geolocation.getCurrentPosition(locationSuccess);
    setInterval(() => {
        geolocation.getCurrentPosition(locationSuccess,locationError);
    }, 120*1000);
    //TODO https://dev.fitbit.com/build/guides/companion/
}

function locationSuccess(position) {
    if (position !=currentPosition) {
        logger.debug("geolocator location received")
        currentPosition=position;
        if(positionChangedCallback) {
            logger.debug("geolocator position changed")
            positionChangedCallback(currentPosition);
        }
    }
}

function locationError(error) {
    logger.debug("Error: " + error.code,
        "Message: " + error.message);
}