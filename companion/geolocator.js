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
    }, 120*1000);
    //TODO https://dev.fitbit.com/build/guides/companion/
}

function locationSuccess(position) {
    if (position !=currentPosition) {
        console.log("geolocator location received")
        currentPosition=position;
        if(positionChangedCallback) {
            console.log("geolocator position changed")
            positionChangedCallback(currentPosition);
        }
    }
}

function locationError(error) {
    console.log("Error: " + error.code,
        "Message: " + error.message);
}