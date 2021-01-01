import document from "document";
import { showLogger } from "./log_viewer";

export function init() {
    console.log("meteo_alerts init");
}

export function update(alerts) {
    console.log("meteo_alerts update");
    //console.log(JSON.stringify(alerts));
    for (let i = 0; i < 60; i++) {
        updateAlertItem(i,alerts[i].ice.probability, alerts[i].precipitation.probability, alerts[i].precipitation.quantity);
    }
}
function updateAlertItem(index, iceProb, precProb, precQuantity) {
    let precUI = document.getElementById("p_" + index);
    if (precProb > 0) {
        let prob=(0.3 + 0.7 * precProb);
        let hex=byteToHex(prob*255)
        precUI.style.fill = "#"+ hex +"0000";
        precUI.arcWidth = 2 + 18* precQuantity;
        precUI.style.display = "inline";
    } else {
        precUI.style.fill = "#222222";
        precUI.arcWidth = 10;
    }

    let ice = document.getElementById("i_" + index);
    if (iceProb > 0) {
        let prob=Math.min(1,0.3 + 0.7 *iceProb);
        let hex=byteToHex(prob*255);
        ice.style.fill = "#00"+ hex+hex;
        ice.style.display = "inline";
    } else {
        ice.style.fill = "#222222";
        ice.style.opacity = 1;
        ice.style.display = "inline";
    }
}
export function test() {
    console.log("meteo_alerts test");
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            let k=(i + 1) / 60;
            updateAlertItem(i,k,k,k)
        }, 30 * i);
    }
}
var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
function byteToHex(b) {
  return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}