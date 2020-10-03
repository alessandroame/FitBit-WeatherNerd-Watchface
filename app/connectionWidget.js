import document from "document";

import * as messaging from "messaging";

let errorDelay=200;
let disconnectedDelay=200;
let widget=document.getElementById("bt");
let blinkingTimer=null;

if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) setConnected();

messaging.peerSocket.addEventListener("open", setConnected);
messaging.peerSocket.addEventListener("error", setError);
messaging.peerSocket.addEventListener("close",setClosed);

function setConnected(){
    //document.
    console.log("Connected");
    stopBlinking();
    widget.style.fill="#006ED6";
}
function setError(){
    console.log("Connection ERROR");
    startBlinking();
    widget.style.fill="red";
}
function setClosed(){
    console.log("Disconnected");
    startBlinking();
    widget.style.fill="gray";
}

function startBlinking(){
    if (blinkingTimer) {
        clearTimeout(blinkingTimer);
        blinkingTimer=null;
    }
    // setInterval(() => {  
    //     console.log(" blinking ");
    //  }, 100);
    blinkingTimer=setInterval(() => {  
        widget.style.display  = (widget.style.display  == "none"?"inline":"none") ;
    }, 300);
}
function stopBlinking(){
    if (blinkingTimer) {
        clearTimeout(blinkingTimer);
        blinkingTimer=null;
    }
    widget.style.visibility ="inline" ;
}

export function init(){
    console.log("connectionWidget init");
}
