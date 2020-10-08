import * as messaging from "messaging";
let subscriptions = {};

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
  localPublish(topic, data);
  remotePublish(topic, data);
}
export function localPublish(topic, data) {
  //console.log("mediator local publishing topic: " + topic);
  let callbacks = subscriptions[topic];
  if (callbacks != null && callbacks.length > 0) {
    //console.log("mediator found " + callbacks.length + " callbacks for topic: " + topic);
    callbacks.forEach(
      (callback) => {
        callback(data);
      });
  }
}

export function remotePublish(topic, data) {
  //console.log("mediator remote publish on topic "+topic);
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      topic: topic,
      data: data
    });
    return true;
  } else {
    console.warn("mediator remote publish: no peerSocket connection");
    return false;
  }
}

export function ping() {
  //dont use it from app 
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ ping: new Date().getTime() });
  }
}

function pong(ping) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ ping: ping, pong: new Date().getTime() });
  }
}

messaging.peerSocket.addEventListener("message",(evt)=>{
  //console.trace(JSON.stringify(evt));
  var packet = evt.data;
  if (packet.ping) {
    if (packet.pong) {
      let now=new Date().getTime();
      var msg="ping "+(now-packet.ping*1)+ "ms"; //U:"+(packet.pong*1-packet.ping*1)+"ms D:"+(now -packet.pong*1)+"ms";
      console.log(msg);
      remotePublish("Error",msg);
    } else {
      pong(packet.ping);
    }
  } else if (packet.topic) {
    localPublish(packet.topic, packet.data);
  }
});

