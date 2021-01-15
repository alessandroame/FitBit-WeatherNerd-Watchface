import { geolocation } from "geolocation";
import * as logger  from "./logger";

let positionChangedCallback = null;

export function init(onPositionChangedCallback) {
    console.log("geolocator init");
    positionChangedCallback = onPositionChangedCallback;
}
export function getCurrentPosition(forceUpdate) {
  geolocation.getCurrentPosition(function(position) {
    
    onLocationSuccess({
        coords:{
            latitude:position.coords.latitude ,
            longitude: position.coords.longitude,
            forceUpdate:forceUpdate
        }
    });
    //console.log(position.coords.latitude + ", " + position.coords.longitude+"-->"+JSON.stringify(position));
 },onLocationError)
 }

function onLocationSuccess(position) {
    console.log("geolocator position changed "+JSON.stringify(position));
    if (positionChangedCallback) {
        positionChangedCallback(position);
    }
}

function onLocationError(error) {
    logger.error("geolocator onLocationError: " + error.code + "Message: " + error.message);
}
