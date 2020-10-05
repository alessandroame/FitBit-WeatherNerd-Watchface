import * as settings from "./settings";
import { inbox } from "file-transfer";
import * as fs from "fs";
import { vibration } from "haptics";
import * as logger from "../common/logger"

let alertsAvailableCallback = null;
const METEO_FN = "meteo_data.json";
export function init(onAlertsAvailableCallback) {
    try {
        alertsAvailableCallback = onAlertsAvailableCallback;
        inbox.onnewfile = () => { //this.log("onnewfile");
            let fn;
            do {
                fn = inbox.nextFile(); //if (fn) this.log("newfile:"+fn);
                if (fn == METEO_FN) fetchMeteo(fn);
            } while (fn);
        };
        fetchMeteo(METEO_FN);
        vibration.start("nudge");
        setTimeout(() => { vibration.start("nudge"); }, 500);
        setTimeout(() => { vibration.start("nudge"); }, 1000);
    } catch (e) {
        console.error("meteo init throws ex: " + e);
        logger.error("meteo init throws ex: " + e);
        vibration.start("nudge");
    }
}
let alerts = [];
function fetchMeteo(fn) {
    console.log("meteo fetchMeteo");
    let data = readDataFromFile(fn);
    if (!data) return;
    console.log(JSON.stringify(data));
    alerts = [];
    for (let i = 0; i < 12; i++) {
        let d = data[i];
        let h = new Date(d.d).getHours();
        if (h > 11) h = h - 12;
        alerts[h] = {
            precipitation: {
                probability: normalizeValue(d.p.p, 0, 50),
                quantity: normalizeValue(d.p.q, 0, 2)
            },
            ice: {
                probability: d.t.r < 0 ? 1 : 0,
                quantity: d.t.r > 0 ? 0 : normalizeValue(d.t.r * -1, 0, 5)
            }
        };
    }
    console.log(JSON.stringify(alerts));
    logger.info("meteo fetched "+settings.get("lastMeteoUpdate"));
    if (alertsAvailableCallback) alertsAvailableCallback(alerts);
}
function normalizeValue(value, min, max) {
    let v = value - min;
    let vMax = max - min;
    let res = value / vMax;
    //console.log(`normalizeValue value: v: ${v} min: ${min} max:{max} ${value} vMax: ${vMax} res: ${res}  `);
    if (res < 0) res = 0;
    if (res > 1) res = 1;
    return res;
}
function readDataFromFile(fn) {
    try {
        console.log("readDataFromFile " + fn);
        let json = fs.readFileSync(fn, "cbor");
        let data = JSON.parse(json);
        return data;
    } catch (e) {
        console.error("readDataFromFile throws ex: " + e);
        logger.error("readDataFromFile throws ex: " + e);
        
        vibration.start("nudge");
    }
    return null;
}