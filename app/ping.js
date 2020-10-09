import * as logger from "./logger"
import * as messaging from "messaging";

let pingTimeoutID=null;

export function ping() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ ping: new Date().getTime() });
    resetTimeout();
    pingTimeoutID=setTimeout(()=>{
        let msg="ping fails";
        console.log(msg);
        logger.debug(msg);
    },10000);
  }
}

function resetTimeout(){
    if (pingTimeoutID) {
        clearInterval(pingTimeoutID);
        pingTimeoutID=null;
    }
}

messaging.peerSocket.addEventListener("message",(evt)=>{
  //console.trace(JSON.stringify(evt));
  var packet = evt.data;
  if (packet.ping) {
    if (packet.pong) {
      resetTimeout();
      let now=new Date().getTime();
      let msg="ping "+(now-packet.ping*1)+ "ms"; //U:"+(packet.pong*1-packet.ping*1)+"ms D:"+(now -packet.pong*1)+"ms";
      console.log(msg);
      logger.debug(msg);
    } 
  } 
});