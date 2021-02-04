import { vibration } from "haptics";
import * as mediator from "../common/mediator";
import * as fs from "fs";
import { display } from "display";
import * as defaultSettings from "../common/defaultSettings.js";
import { settings } from "cluster";

let _settings = {};

try {
    //load from file
    let data = fs.readFileSync("settings.json", "cbor");
    _settings = data;
    //handle settings from companion
} catch (e) {
    console.error("settings fetch throw exception" + e);
}

mediator.subscribe("setting", (data) => {
    console.log("notify settings [" + data.key + "] changed from: " + data.oldValue + " to: " + data.value);

    set(data.key, data.value);
    var loweredKey=data.key.toLowerCase();
    if (loweredKey.indexOf('color') != -1 || loweredKey.indexOf('wind') != -1) {
        display.poke();
        vibration.start("bump");
        //console.warn("poke");
    }
});

export function init() {
    console.log("settings init")
}

export function subscribe(key, callback) {
    mediator.subscribe("setting_" + key, (value) => {
        if (value==="undefined") value = defaultSettings.get(key);
        callback(value);
    });
    callback(get(key, defaultSettings.get(key)));
}

export function get(key) {
    // if (_settings[key] == null) {
    //     set(key,defaultValue,true);
    //     const data = {
    //         key: key,
    //         oldValue: null,
    //         value: defaultValue
    //       };
    //     setTimeout(()=>{
    //         let topic = "setting_changed";
    //         mediator.remotePublish(topic, data);
    //     },10000);
    // }
    return _settings[key]??defaultSettings.get(key);
}

export function set(key, value,dontPropagate) {
    _settings[key] = value;
    if (!dontPropagate) mediator.localPublish("setting_" + key, value);
    try {
        fs.writeFileSync("settings.json", _settings, "cbor");
    } catch (e) {
        console.error("settings store throw exception" + e);
    }
    //vibration.start("bump");
}