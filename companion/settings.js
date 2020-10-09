import { settingsStorage } from "settings";
import * as mediator from "../common/mediator";

export function init() {
  console.log("settings init")

  settingsStorage.addEventListener("change", (evt) => {
//    console.trace();
    if (evt.key[0] == '_') return;
    /*{
      console.warn("<<<<<<<< accrocchio " + evt.key + " >>>>>>>>");
      evt.key = evt.key.substring(1);
      evt.oldValue = null;
      evt.newValue = settingsStorage.getItem(evt.key);
      notify(evt);
    } else */{
      notify(evt);
    }
  });
}

export function set(key, value) {
  settingsStorage.setItem(key, value);
}
export function get(key, defvalue) {
  return JSON.parse(settingsStorage.getItem(key, defvalue));
}

export function subscribe(key, callback) {
  mediator.subscribe("setting_" + key, (data) => {
    callback(data.value);
  });
  let value = get(key, null);
  if (value != null) callback(value);
}

function notify(evt) {
  console.log("notify " + evt.key );
  const data = {
    key: evt.key,
    oldValue: JSON.parse(evt.oldValue),
    value: JSON.parse(evt.newValue)
  };
  let topic = "setting_" + evt.key;
  mediator.localPublish(topic, data);
  if (!mediator.remotePublish("setting", data)) console.warn("cant publish on remote endopoint " + topic);
}

