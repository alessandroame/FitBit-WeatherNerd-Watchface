import { settingsStorage } from "settings";
import * as defaultSettings from "../common/defaultSettings";
import * as mediator from "../common/mediator";
let initialized=false;
export function init() {
  for (let key in defaultSettings.defaultValues){
    if (!settingsStorage.getItem(key)){
      let value=defaultSettings.defaultValues[key];
      console.log("applying default value "+key+"="+value)
      settingsStorage.setItem(key,value);
    }
    initialized=true;
}
console.log("settings init");

  settingsStorage.addEventListener("change", (evt) => {
//    console.warn("<<<<<<<< " + evt.key + " >>>>>>>>");
    if (initialized) notify(evt);
  });
}
// mediator.subscribe("setting_changed",(data)=>{
//   settingsStorage.setItem(data.key, data.value);
//   console.warn("applying default value for "+data.key+"="+data.value)
// });

export function set(key, value) {
  settingsStorage.setItem(key, value);
  notify({
    key: key,
    oldValue: null,
    newValue: value
  });
}
export function get(key, defvalue) {
  try {
    let res= settingsStorage.getItem(key)??defvalue;
//    console.error(key+"="+res);
    return res;
    //return JSON.parse(json);
  } catch (e) {
    console.error("get setting " + key + " throws:" + e + "\nJSON:" + json);
    return defvalue;
  }
}

export function subscribe(key, callback) {
  try {
    mediator.subscribe("setting_" + key, (data) => {
      callback(data.value);
    });
    let value = get(key, null);

    if (value != null) callback(value);
  } catch (e) {
    console.error("subscribe fails " + e);
    console.trace();
  }
}

function notify(evt) {
  if (evt.key[0]=="_") return;
  throttle(evt.key,()=>{
    console.log("notify " + evt.key);
    try{
      const data = {
        key: evt.key,
        oldValue: evt.oldValue,
        value: evt.newValue
      };
      let topic = "setting_" + evt.key;
      mediator.localPublish(topic, data);
      if (!mediator.remotePublish("setting", data)) console.warn("cant publish on remote endopoint " + topic);
    }catch(e){
      console.error("key ["+evt.key+"] oldValue="+evt.oldValue+" newValue="+evt.newValue+" throws: "+e);    
    }
    //console.error("key ["+evt.key+"] oldValue="+evt.oldValue+" newValue="+evt.newValue);    
  },300,"notify settings "+evt.key+" "+evt.newValue);
}

let throttleTimers = {};
function throttle(key,func, delay,msg) {
    if (throttleTimers[key]) { 
      clearTimeout(throttleTimers[key]);
      console.log("throttled "+msg); 
    }
    throttleTimers[key] = setTimeout(() => { throttleTimers[key] = null; func(); }, delay);
}

