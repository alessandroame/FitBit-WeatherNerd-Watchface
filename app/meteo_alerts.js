import document from "document";
import * as settings from "./settings"
import * as logger from "./logger";

let lastAlerts=null;
export function init() {
    console.log("meteo_alerts init");
}

let currentMode=0;
export function update(alerts,nextHourProbabilities,mode) {
    lastAlerts=alerts;
    console.log("meteo_alerts update mode: "+mode);

//    console.log(JSON.stringify(alerts));
    for (let i = 0; i < 60; i++) {
        let a=alerts[i];
        updateAlertItem(i,a.ice.probability, a.precipitation.probability, a.precipitation.quantity,a.wind.speed,mode);
        //logger.warning("ws: "+a.wind.speed+" "+a.wind.temp);
    }
    updateBackground(nextHourProbabilities.ice,nextHourProbabilities.prec,nextHourProbabilities.wind);
    currentMode=mode;
}

function updateBackground(iceProb,precProb,windProb){
    try {   
        //console.warn(iceProb,precProb,windProb);
        if (settings.get("automaticBackgroundColor")=="true"){
            let color="grey";
            if (precProb>0){
                //console.warn("precProb: "+precProb);
                let offset=70;
                color="#"+byteToHex(precProb*(155-offset)+offset)+"0000";
            }else if (iceProb>0){
                let offset=100;
                let hex=byteToHex(iceProb*(255-offset)+offset);
                color="#00"+hex+hex;
                //console.warn("iceProb: "+iceProb,hex,color);
            }else if (windProb>0){
                //console.warn("windProb: "+windProb);
                let offset=80;
                color="#00"+byteToHex(windProb*(110-offset)+offset)+byteToHex(windProb*(214-offset)+offset);
            }
            //console.warn("clockBackgroundColor: "+color);
            settings.set("clockBackgroundColor",color);
        }
    }catch(e){
        logger.error("updateBackground throws"+e);
    }
}

function updateAlertItem(index, iceProb, precProb, precQuantity,windSpeed,mode) {
    let mainAlert = document.getElementById("m_" + index);
    let secondaryUI = document.getElementById("s_" + index);


    if (precProb > 0) {
        precProb=(0.3 + 0.7 * precProb);
    }
    
    let precColor="#"+ byteToHex(precProb*255)+"0000";
    
    if (mode==0){
        //console.warn(precProb)
        //prec
        if (precProb>0){
            mainAlert.style.fill = precColor;
            mainAlert.arcWidth = 4 + 16* precQuantity;
        }else{
            mainAlert.style.fill = "#222222";
            mainAlert.arcWidth = 8;
        }
        //wind
        if (windSpeed>0){
            secondaryUI.style.fill="#006ED6";
        } else{
            secondaryUI.style.fill = "#222222";
        }
    }else{
        //wind
        if (windSpeed>0){
            mainAlert.style.fill = "#006ED6";
            mainAlert.arcWidth = 4+(16 * (windSpeed));
        }else{
            mainAlert.style.fill = "#222222";
            mainAlert.arcWidth = 8;
        }
        //prec
        if (precProb>0){
            secondaryUI.style.fill=precColor;
        } else{
            secondaryUI.style.fill = "#222222";
        }

    }

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
        //setTimeout(() => {
            let k=(i + 1) / 60;
            updateAlertItem(i,k,k,k,k,currentMode);
        //}, 28 * i);
    }
}
var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
function byteToHex(b) {
  return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}