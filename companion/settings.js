import { settingsStorage } from "settings";
import * as defaultSettings from "../common/defaultSettings";
import * as mediator from "../common/mediator";
let initialized=false;
export function init() {
    //handling unitSystem change to remove in next releases
    migrateUnitSystem();

  for (let key in defaultSettings.defaultValues){
    if (!settingsStorage.getItem(key)){
      let value=defaultSettings.defaultValues[key];
      console.log("applying default value "+key+"="+value)
      settingsStorage.setItem(key,value);
    }
    initialized=true;
}

function migrateUnitSystem(){
    //handling unitSystem change to remove in next releases
    var unitSystem=settingsStorage.getItem("unitSystem")
    if (unitSystem!=null && unitSystem!="null"){
      console.warn("found unitSystem: "+unitSystem+" -> start settings conversion");
      if (unitSystem=="si"){
        settingsStorage.setItem("_tempUOM","C");
        settingsStorage.setItem("tempUOM","C");
  
        settingsStorage.setItem("_speedUOM","km/h");
        settingsStorage.setItem("speedUOM","km/h");
      }else{
        settingsStorage.setItem("_tempUOM","F");
        settingsStorage.setItem("tempUOM","F");
  
        settingsStorage.setItem("_speedUOM","knots");
        settingsStorage.setItem("speedUOM","knots");
      }
      settingsStorage.setItem("unitSystem",null);
      console.warn("unitSystem settings conversion done");
    }
}

console.log("settings init");

  settingsStorage.addEventListener("change", (evt) => {
//    console.warn("<<<<<<<< " + JSON.stringify(evt) + " >>>>>>>>");
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
    //console.log("notify "+JSON.stringify(evt));
    try{
      const data = {
        key: evt.key,
        oldValue: evt.oldValue,
        value:  evt.newValue
      };
//      console.error("notify "+JSON.stringify(data));
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
//      console.log("throttled "+msg); 
    }
    throttleTimers[key] = setTimeout(() => { throttleTimers[key] = null; func(); }, delay);
}

