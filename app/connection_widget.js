import document from "document";

import * as messaging from "messaging";

let errorDelay = 200;
let disconnectedDelay = 200;
let widget = document.getElementById("bt");
widget.onclick=function(){
    //dialog test
    showConnectionLostDialog();
}
let blinkingTimer = null;

if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) setConnected();

messaging.peerSocket.addEventListener("open", setConnected);
messaging.peerSocket.addEventListener("error", setError);
messaging.peerSocket.addEventListener("close", setClosed);

function setConnected() {
    console.log("Connected");
    stopBlinking();
    widget.style.fill = "#006ED6";
}
function setError() {
    console.log("Connection ERROR");
    showConnectionLostDialog();
    startBlinking();
    widget.style.fill = "red";
}
function setClosed() {
    console.log("Disconnected");
    showConnectionLostDialog();
    startBlinking();
    widget.style.fill = "gray";
}

function showConnectionLostDialog() {
    document.location.assign("connection_dialog.view").then(() => {
        console.log(" another view loaded" + document.getElementById("btn_snooze"));
        document.getElementById("btn_snooze").addEventListener("click", (evt) => {
            console.log("btn_snooze");
            document.history.back();
        });
        document.getElementById("btn_dismiss").addEventListener("click", (evt) => {
            console.log("btn_dismiss");
            document.history.back();
        });
    });
}

function startBlinking() {
    if (blinkingTimer) {
        clearTimeout(blinkingTimer);
        blinkingTimer = null;
    }
    // setInterval(() => {  
    //     console.log(" blinking ");
    //  }, 100);
    blinkingTimer = setInterval(() => {
        widget.style.display = (widget.style.display == "none" ? "inline" : "none");
    }, 300);
}
function stopBlinking() {
    if (blinkingTimer) {
        clearTimeout(blinkingTimer);
        blinkingTimer = null;
    }
    widget.style.visibility = "inline";
}

export function init() {
    console.log("connectionWidget init");
}
// function dismiss() {
//     if (connectionLostUpdaterTimerID !== null) clearInterval(connectionLostUpdaterTimerID);
//     closeConnectionLostDialog();
// };
// function snooze() {
//     closeConnectionLostDialog();
//     settingsSet("snoozedToTS", new Date().getTime() + 5 * 60 * 1000);
//     if (connectionLostUpdaterTimerID !== null) clearInterval(connectionLostUpdaterTimerID);
//     connectionLostUpdaterTimerID = setTimeout(onConnectionLost, 1000 * 30);
// }
