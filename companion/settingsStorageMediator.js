import { settingsStorage } from "settings";
import * as messaging from "../common/message_mediator";

export function init() {
  console.log("settingsStorageMediator init")

  settingsStorage.addEventListener("change", (evt) => {
    if (evt.key[0] == '_') {
      evt.key = evt.key.substring(1);
      evt.oldValue = null;
      evt.newValue = settingsStorage.getItem(evt.key);
      console.info("accrocchio!!!");
    }
    publishSettingsChanged(evt);
  });
}

function publishSettingsChanged(evt) {
  const data = {
    key: evt.key,
    oldValue: JSON.parse(evt.oldValue),
    value: JSON.parse(evt.newValue)
  };
  messaging.publish("setting", data);

}