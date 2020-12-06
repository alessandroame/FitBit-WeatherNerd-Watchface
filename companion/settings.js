import { settingsStorage } from "settings";
import * as mediator from "../common/mediator";

export function init() {
  console.log("settings init")

  settingsStorage.addEventListener("change", (evt) => {
//    console.warn("<<<<<<<< " + evt.key + " >>>>>>>>");
    notify(evt);
  });
}

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
  console.log("notify " + evt.key);
  try{
    if (evt.key[0]=="_") return;
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
}

