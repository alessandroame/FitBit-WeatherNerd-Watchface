import * as messaging from "messaging";
let subscriptions = {};
//to handling doblue publish when in simulator
let mediatorID = new Date().getTime();
console.warn("mediator init with ID:" + mediatorID);
let listeners = [];
export const STATE_ERROR = -1;
export const STATE_DISCONNECTED = 0;
export const STATE_CONNECTED = 1;
let connectionState = -99;

export function addConnectionStateListener(callback) {
  listeners.push(callback);
}

function setConnectionState(state) {
  if (connectionState == state) return;
  console.log("connection state changed from "+connectionState+" to "+state);
  connectionState = state;
  notifyConnectionEvent(state);
}

function notifyConnectionEvent(state) {
  listeners.forEach(cb => {
    try {
      cb(state);
    } catch (e) {
      console.error("notifyConnectionEvent fails: " + e);
      console.trace();
    }
  });
}

function trySend(data) {
  try {
    messaging.peerSocket.send(data);
    return true;
  } catch (e) {
//    console.error("Send fails: " + e);
//    console.warn("Data not sent: " + JSON.stringify(data));
    setConnectionState(STATE_DISCONNECTED);
    return false;
  }
}

messaging.peerSocket.addEventListener("close", () => { setConnectionState(STATE_DISCONNECTED); });
messaging.peerSocket.addEventListener("error", () => { setConnectionState(STATE_ERROR); });

messaging.peerSocket.addEventListener("message", (evt) => {
  setConnectionState(STATE_CONNECTED);
  //console.warn(mediatorID+" "+JSON.stringify(evt));
  var packet = evt.data;
  if (packet.sender && packet.sender == mediatorID) {
    console.error("skipping message is from same mediator  why??");
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

export function subscribe(topic, callback) {
  if (!subscriptions[topic]) subscriptions[topic] = [];
  subscriptions[topic].push(callback);
  console.log("mediator subscribe to " + topic);
}

export function publish(topic, data) {
  localPublish(mediatorID, topic, data);
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
  return trySend({
    sender: mediatorID,
    topic: topic,
    data: data
  });
}

function pong(ping) {
  console.log("pong");
  trySend({ sender: mediatorID, ping: ping, pong: new Date().getTime() });
}

