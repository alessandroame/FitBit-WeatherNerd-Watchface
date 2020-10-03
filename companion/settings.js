import { settingsStorage } from "settings";
import * as messaging from "../common/message_mediator";

export function init(){
    console.log("settings init")
}
  
settingsStorage.addEventListener("change", (evt) => {
  const data={
      key:evt.key,
      oldValue:JSON.parse(evt.oldValue),
      value:JSON.parse(evt.newValue) 
    };
  messaging.publish("setting",data);
});