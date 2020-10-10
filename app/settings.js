import { vibration } from "haptics";
import * as mediator from "../common/mediator";
import * as fs from "fs";
import { display } from "display";

let _settings={};

try {
    //load from file
    let data = fs.readFileSync("settings.json", "cbor");
    _settings = data;
    //handle settings from companion
} catch (e) {
    console.error("settings fetch throw exception" + e);
}
mediator.subscribe("setting",(data)=>{
    console.log("notify settings ["+data.key+"] changed from: "+data.oldValue+" to: "+data.value);
    set(data.key,data.value);
    display.poke();
});   


export function init(){
    console.log("settings init")
}
  
export function subscribe(key,callback,defValue){
    mediator.subscribe("setting_"+key,(value)=>{
        value=value|| defValue;
        callback(value);
    });
    callback(_settings[key]||defValue);
}

export function get(key, defaultValue) {
    return _settings[key] ? _settings[key] : defaultValue;
}

export function set(key, value) {
    _settings[key] = value;
    console.warn("set " + key + " to " + JSON.stringify(value));
    mediator.localPublish("setting_"+key,value);
    try {
        fs.writeFileSync("settings.json", _settings, "cbor");
    } catch (e) {
        console.error("settings store throw exception" + e);
    }
    vibration.start("bump");
}