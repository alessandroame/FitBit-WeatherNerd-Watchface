import * as logger from "./logger"
import * as messaging from "messaging";
import { memory } from "system";

let pingTimeoutID = null;

export function ping() {
  try {
    resetTimeout();
    messaging.peerSocket.send({ ping: new Date().getTime() });
    pingTimeoutID = setTimeout(() => {
      let msg = "ping fails";
      logger.info(msg);
    }, 5000);
  } catch (e) {
    console.error("send fails:"+ e);
    logPingResponse("ping no network");
    return false;
  }
}

function resetTimeout() {
  if (pingTimeoutID) {
    clearInterval(pingTimeoutID);
    pingTimeoutID = null;
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  //console.trace(JSON.stringify(evt));
  var packet = evt.data;
  if (packet.ping) {
    if (packet.pong) {
      resetTimeout();
      let now = new Date().getTime();
      let msg = `ping ${now - packet.ping * 1}ms `; //U:"+(packet.pong*1-packet.ping*1)+"ms D:"+(now -packet.pong*1)+"ms";
      logPingResponse(msg);
    }
  }
});

function logPingResponse(msg) {
  msg += ` MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}%`;
  logger.info(msg);
}