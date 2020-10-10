import { geolocation } from "geolocation";
import * as logger  from "./logger";

let positionChangedCallback = null;

export function init(onPositionChangedCallback) {
    console.log("geolocator init");
    positionChangedCallback = onPositionChangedCallback;
    //getCurrentPosition();
}


//TODO REMOVE 
//setInterval(getCurrentPosition, 120000);

export function getCurrentPosition() {
//  geolocation.getCurrentPosition(, onLocationError, { timeout: 10 * 1000 });
  geolocation.getCurrentPosition(function(position) {
    onLocationSuccess({
        coords:{
            latitude:position.coords.latitude ,
            longitude: position.coords.longitude
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
    logger.error("onLocationError: " + error.code + "Message: " + error.message);
}
