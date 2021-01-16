import document from "document";
import { showLogger } from "./log_viewer";

export function init() {
    console.log("meteo_alerts init");
}
let mode=0; 
export function setPrecipitationMode(){
    mode=0;//precipitation
}
export function setWindMode(){
    mode=1;//wind
}

let lastAlerts=null;
export function update(alerts) {
    lastAlerts=alerts;
    console.log("meteo_alerts update");
//    console.log(JSON.stringify(alerts));
    document.getElementById("alert_mode").style.fill=mode==0?"#ff0000":"#0000BB";
    for (let i = 0; i < 60; i++) {
        let a=alerts[i];
        updateAlertItem(i,a.ice.probability, a.precipitation.probability, a.precipitation.quantity,a.wind.speed,a.wind.temp);
    }
}

document.getElementById("alert_mode_button").onclick=()=>{
    if (mode==0) mode=1;
    else mode=0;
    update(lastAlerts);
};

function updateAlertItem(index, iceProb, precProb, precQuantity,windSpeed,wt) {
    let alertUI = document.getElementById("p_" + index);
    if (mode==1){
        if (windSpeed>0){
            alertUI.style.fill = "#0000BB";
            let level=(20 * (windSpeed));
            alertUI.arcWidth = level;
//            console.log(wt+"-"+windSpeed+"-"+level);
        }else{
            alertUI.style.fill = "#222222";
            alertUI.arcWidth = 10;
//            console.log(wt+"-"+windSpeed);
        } 
    }else{
        if (precProb > 0) {
            let prob=(0.3 + 0.7 * precProb);
            let hex=byteToHex(prob*255);
            alertUI.style.fill = "#"+ hex +"0000";
            alertUI.arcWidth = 2 + 18* precQuantity;
        } else {
            alertUI.style.fill = "#222222";
            alertUI.arcWidth = 10;
        }
    }
    /*document.getElementById("pa_" + index).to=precUI.style.fill;
    precUI.animate("enable");*/

    let ice = document.getElementById("i_" + index);
    if (iceProb > 0) {
        let prob=Math.min(1,0.3 + 0.7 *iceProb);
        let hex=byteToHex(prob*255);
        ice.style.fill = "#00"+ hex+hex;
    } else {
        ice.style.fill = "#222222";
        ice.style.opacity = 1;
    }
/*    document.getElementById("ia_" + index).to=ice.style.fill;
    ice.animate("enable");*/
}
export function test() {
    console.log("meteo_alerts test");
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            let k=(i + 1) / 60;
            updateAlertItem(i,k,k,k,k)
        }, 28 * i);
    }
}
var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
function byteToHex(b) {
  return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}