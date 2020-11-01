import document from "document";

export function init() {
    console.log("meteo_alerts init");
}

export function update(alerts) {
    console.log("meteo_alerts update");
    //console.log(JSON.stringify(alerts));
    for (let i = 0; i < 12; i++) {
        for (let n = 0; n < 5; n++) {
            let prec = document.getElementById("p_" + (i * 5 + n));
            prec.style.opacity = alerts[i].precipitation.probability;
            prec.arcWidth = 16 * alerts[i].precipitation.quantity;

            let ice = document.getElementById("i_" + (i * 5 + n));
            ice.style.opacity = alerts[i].ice.probability;
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

        let ice = document.getElementById("i_" + i);
        ice.style.opacity = (i + 1) / 12;
        //}, 30 * i);
    }
}