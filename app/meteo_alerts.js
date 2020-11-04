import document from "document";
import { showLogger } from "./log_viewer";

export function init() {
    console.log("meteo_alerts init");
}

export function update(alerts) {
    console.log("meteo_alerts update");
    //console.log(JSON.stringify(alerts));
    for (let i = 0; i < 12; i++) {
        let alert = alerts[i];
        let precData = alert.precipitation;
        for (let n = 0; n < 5; n++) {
            updateAlertItem(i*5+n,alert.ice.probability, precData.probability, precData.quantity);
        }
    }
}
export function test() {
    console.log("meteo_alerts test");
    for (let i = 0; i < 60; i++) {
        //setTimeout(() => {
            let k=(i + 1) / 60;
            updateAlertItem(i,k,k,k)
        //}, 30 * i);
    }
}

function updateAlertItem(index, iceProb, precProb, precQuantity) {
    let precUI = document.getElementById("p_" + index);
    if (precProb > 0) {
        precUI.style.opacity = 0.3 + 0.7 * precProb;
        precUI.arcWidth = 2 + 18* precQuantity;
        precUI.style.display = "inline";
    } else {
        precUI.style.display = "none";
    }

    let ice = document.getElementById("i_" + index);
    if (iceProb > 0) {
        ice.style.opacity = 0.3 + 0.7 *iceProb;
        ice.style.display = "inline";
    } else {
        ice.style.display = "none";
    }
}