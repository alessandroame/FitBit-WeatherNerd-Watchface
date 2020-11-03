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
                    precUI.style.display = "inline";
                    precUI.style.opacity = precData.probability;
                    precUI.arcWidth = 16 * precData.quantity;
                } else {
                    precUI.style.display = "none";
                }

                let ice = document.getElementById("i_" + (i * 5 + n));
                if (alert.ice.probability > 0) {
                    ice.style.display = "inline";
                    ice.style.opacity = alert.ice.probability;
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
        prec.style.display = "inline";
        prec.style.opacity = (i + 1) / 60;
        prec.arcWidth = 15 * (i + 1) / 60;

        let ice = document.getElementById("i_" + i);
        ice.style.display = "inline";
        ice.style.opacity = (i + 1) / 60;
        //}, 30 * i);
    }
}