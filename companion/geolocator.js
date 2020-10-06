import { geolocation } from "geolocation";
import * as message_mediator from "../common/message_mediator";

let positionChangedCallback = null;

export function init(onPositionChangedCallback) {
    console.log("geolocator init");
    positionChangedCallback = onPositionChangedCallback;
}

export function getCurrentPosition() {
    geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
}

function onLocationSuccess(position) {
    if (positionChangedCallback) {
        console.log("geolocator position changed")
        positionChangedCallback(position);
    }
}

function onLocationError(error) {
    var msg = "onLocationError: " + error.code + "Message: " + error.message;
    console.error(msg);
    message_mediator.publish("Error", {
        code: 1,
        msg: msg
    });
}
