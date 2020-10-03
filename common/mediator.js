let subscriptions={};
let intanceID=new Date().getUTCMilliseconds();

export function subscribe(topic,callback){
  if (!subscriptions[topic]) subscriptions[topic]=[];
  subscriptions[topic].push(callback);
  console.log("Mediator ["+intanceID+"] subscriptions "+subscriptions.length);
}

function notify(evt) {
  var packet=evt.data;
  let callbacks=subscriptions[packet.topic];
  if (callbacks==null || callbacks.length==0) {
    //console.warn("Mediator ["+intanceID+"] found no subscription for topic: "+packet.topic+"   stack:"+new Error().stack);
    return;
  }
  //console.log("Mediator ["+callbacks.length+"] FOUND subscription for topic: "+packet.topic);
  callbacks.forEach(
    (callback)=>{
      callback(packet.data);
    });
}

export function publish(topic,data) {
  //console.log("Mediator ["+intanceID+"] publishing topic: "+topic);
  let callbacks=subscriptions[topic];
  if (callbacks==null || callbacks.length==0) {
    //console.warn("Mediator ["+intanceID+"] found no subscription for topic: "+topic+"   stack:"+new Error().stack);
    return;
  }
  //console.log("Mediator ["+intanceID+"] found "+callbacks.length+" callbacks for topic: "+topic);
  callbacks.forEach(
    (callback)=>{
      callback(data);
    });
}
