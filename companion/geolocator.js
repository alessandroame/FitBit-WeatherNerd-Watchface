import { geolocation } from "geolocation";

let watchID = null;
let currentPosition = null;
let positionChangedCallback = null;

export function init(onPositionChangedCallback) {
    console.log("geolocator init");
    positionChangedCallback = onPositionChangedCallback;
    geolocation.getCurrentPosition(locationSuccess);
    setInterval(() => {
        geolocation.getCurrentPosition(locationSuccess,locationError);
    }, 100*1000);
    //TODO https://dev.fitbit.com/build/guides/companion/
}

function locationSuccess(position) {
    if (position !=currentPosition) {
        currentPosition=position;
        if(positionChangedCallback) positionChangedCallback(currentPosition);
    }
}

function locationError(error) {
    console.log("Error: " + error.code,
        "Message: " + error.message);
}