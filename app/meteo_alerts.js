import document from "document";

let alertWidgets = [];
export function init() {
    console.log("meteo_alerts init");
    for (let i = 0; i < 12; i++) {
        alertWidgets[i] = document.getElementById("meteoAlert" + i);
        //console.log("----------"+alertWidgets[i]);
    }
}

export function update(alerts) {
    console.log("meteo_alerts update");
    //console.log(JSON.stringify(alerts));
    for (let i = 0; i < 12; i++) {
        let prec = alertWidgets[i].getElementById("precipitation");
        prec.style.opacity = alerts[i].precipitation.probability;
        prec.arcWidth = 14 * alerts[i].precipitation.quantity;

        let ice = alertWidgets[i].getElementById("ice");
        ice.style.opacity = alerts[i].ice.probability;
    }
}
export function test() {
    console.log("meteo_alerts test");
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            let prec = alertWidgets[i].getElementById("precipitation");
            prec.style.opacity = (i + 1) / 12;
            prec.arcWidth = 13 * (i + 1) / 12;

            let ice = alertWidgets[i].getElementById("ice");
            ice.style.opacity = (i + 1) / 12;
        }, 20 * i);
    }
}