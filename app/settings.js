import { vibration } from "haptics";
import * as messaging from "../common/message_mediator";
import * as mediator from "../common/mediator";
import * as fs from "fs";

let _settings={};

try {
    //load from file
    let data = fs.readFileSync("settings.json", "cbor");
    _settings = data;
    //handle settings from companion
} catch (e) {
    console.error("settings fetch throw exception" + e);
}
messaging.subscribe("setting",(data)=>{
    console.log("notified setting changed: "+JSON.stringify(data));
    //console.log("settings ["+data.key+"] changed from: "+data.oldValue+" to: "+data.value);
    set(data.key,data.value);
});   


export function init(){
    console.log("settings init")
}
  
export function subscribe(key,callback){
    mediator.subscribe("setting_"+key,callback);
    if (_settings[key]) callback(_settings[key]);
}
export function get(key, defaultValue) {
    return _settings[key] ? _settings[key] : defaultValue;
}

export function set(key, value) {
    _settings[key] = value;
    mediator.publish("setting_"+key,value);
    try {
        fs.writeFileSync("settings.json", _settings, "cbor");
    } catch (e) {
        console.error("settings store throw exception" + e);
    }
    try {
        console.log("set " + key + " to " + value);
        vibration.start("bump");
    } catch (e) {
        console.error("Pattern search throws: " + e);
    }
}