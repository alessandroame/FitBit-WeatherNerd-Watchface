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
            try {
                let precUI = document.getElementById("p_" + (i * 5 + n));
                if (precData.probability > 0) {
                    //console.log(JSON.stringify(precData))
                    precUI.style.opacity = 0.3 + 0.7 * precData.probability;
                    precUI.arcWidth = 2 + 14 * precData.quantity;
                    precUI.style.display = "inline";
                } else {
                    precUI.style.display = "none";
                }

                let ice = document.getElementById("i_" + (i * 5 + n));
                if (alert.ice.probability > 0) {
                    ice.style.opacity = alert.ice.probability;
                    ice.style.display = "inline";
                } else {
                    ice.style.display = "none";
                }
            } catch (e) {
                logger.error(e);
            }
        }
        // let prec = alertWidgets[i].getElementById("precipitation");
        // prec.style.opacity = alerts[i].precipitation.probability;
        // prec.arcWidth = 14 * alerts[i].precipitation.quantity;

        // let ice = alertWidgets[i].getElementById("ice");
        // ice.style.opacity = alerts[i].ice.probability;
    }
}
export function test() {
    console.log("meteo_alerts test");
    for (let i = 0; i < 60; i++) {
        //setTimeout(() => {
        let prec = document.getElementById("p_" + i);
        prec.style.opacity = (i + 1) / 60;
        prec.arcWidth = 15 * (i + 1) / 60;
        prec.style.display = "inline";

        let ice = document.getElementById("i_" + i);
        ice.style.opacity = (i + 1) / 60;
        ice.style.display = "inline";
        //}, 30 * i);
    }
}

function updateAlertUI(index, iceProb, precProb, precQuantity) {
    let precUI = document.getElementById("p_" + index;
    if (precProb > 0) {
        precUI.style.opacity = 0.3 + 0.7 * precProb;
        precUI.arcWidth = 2 + 14 * precQuantity;
        precUI.style.display = "inline";
    } else {
        precUI.style.display = "none";
    }

    let ice = document.getElementById("i_" + (i * 5 + n));
    if (iceProb > 0) {
        ice.style.opacity = iceProb;
        ice.style.display = "inline";
    } else {
        ice.style.display = "none";
    }
}