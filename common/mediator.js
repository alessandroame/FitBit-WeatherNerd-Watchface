import * as messaging from "messaging";
let subscriptions = {};

//to handling doblue publish when in simulator
let mediatorID=new Date().getTime();
console.error("mediator init with ID:"+mediatorID);

export function subscribe(topic, callback) {
  if (!subscriptions[topic]) subscriptions[topic] = [];
  subscriptions[topic].push(callback);
  console.log("mediator subscribe to " + topic);
}

function notify(evt) {
  var packet = evt.data;
  let callbacks = subscriptions[packet.topic];
  if (callbacks != null && callbacks.length > 0) {
    //console.log(mMediator ["+callbacks.length+"] FOUND subscription for topic: "+packet.topic);
    callbacks.forEach(
      (callback) => {
        callback(packet.data);
      });
  }
  else {
    console.warn("mediator no subscription for topic: " + packet.topic + "   stack:" + new Error().stack);
  }
  remotePublish(topic, data);
}

export function publish(topic, data) {
  localPublish(mediatorID,topic, data);
  remotePublish(topic, data);
}
export function localPublish(topic, data) {
//  console.trace();
//  console.log(mediatorID+" mediator local publishing topic: " + topic);
  let callbacks = subscriptions[topic];
  if (callbacks != null && callbacks.length > 0) {
    //console.log("mediator found " + callbacks.length + " callbacks for topic: " + topic);
    callbacks.forEach(
      (callback) => {
//        console.warn(mediatorID+" callback for topic: " + topic);
        callback(data);
      });
  }
}

export function remotePublish(topic, data) {
  //console.log("mediator remote publish on topic "+topic);
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      sender: mediatorID,
      topic: topic,
      data: data
    });
    return true;
  } else {
    console.warn("mediator remote publish: no peerSocket connection");
    return false;
  }
}


function pong(ping) {
  console.log("pong");
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({sender: mediatorID, ping: ping, pong: new Date().getTime() });
  }
}


messaging.peerSocket.addEventListener("message",(evt)=>{
  //console.warn(mediatorID+" "+JSON.stringify(evt));
  var packet = evt.data;
  if (packet.sender&&packet.sender==mediatorID){
    console.warn("skipping message is from same mediator  why??");
    return;
  }
  if (packet.ping) {
    if (!packet.pong) {
      pong(packet.ping);
    }
  } else if (packet.topic) {
    localPublish(packet.topic, packet.data);
  }
});

