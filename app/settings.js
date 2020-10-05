import * as logger from "../common/logger";
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
    logger.error("settings fetch throw exception" + e);
}
messaging.subscribe("setting",(data)=>{
    logger.debug("notified setting changed: "+JSON.stringify(data));
    //logger.debug("settings ["+data.key+"] changed from: "+data.oldValue+" to: "+data.value);
    set(data.key,data.value);
});   


export function init(){
    logger.debug("settings init")
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
        logger.error("settings store throw exception" + e);
    }
    try {
        logger.debug("set " + key + " to " + JSON.stringify(value));
        vibration.start("bump");
    } catch (e) {
        logger.error("Pattern search throws: " + e);
    }
}