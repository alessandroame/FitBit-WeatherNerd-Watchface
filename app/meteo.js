import { inbox } from "file-transfer"
import * as fs from "fs"
import { vibration } from "haptics"
import * as logger from "./logger"
import * as geom from '../common/geom'
import { memory } from "system";


function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc}`;
    console.log(msg);
    return msg;
}
let alertsAvailableCallback = null;
const METEO_FN = "meteo_data.json";
export function init(onAlertsAvailableCallback) {
    try {
        alertsAvailableCallback = onAlertsAvailableCallback;
        inbox.onnewfile = () => { //this.log("onnewfile");
            let fn;
            do {
                fn = inbox.nextFile(); //if (fn) this.log("newfile:"+fn);
                if (fn == METEO_FN) {
                    logger.debug("meteo available");
                    fetchMeteo();
                }
            } while (fn);
        };
        fetchMeteo();
    } catch (e) {
        logger.error("meteo init throws ex: " + e);
        vibration.start("nudge");
    }
}

function fetchMeteo() {
    console.log("meteo fetchMeteo");
memStats(11111);
    let alerts = [];
    let forecasts = [];
    let meteoData = readDataFromFile(METEO_FN);
    if (!meteoData) return;
    //console.log(JSON.stringify(meteo));
    let dt=new Date(meteoData.data[0].d);
    let angle=geom.hoursToAngle(dt.getHours(),dt.getMinutes());
    var offset=(angle/360*60).toFixed()*1;
memStats(5555);

    for (let i=0;i<meteoData.data.length;i++){
        let d=meteoData.data[i];
        let index=i+offset;
        if (index>59) index=index-60;
        alerts[index]={
            precipitation: {
                probability: d.p.p,
                quantity: normalizeValue(d.p.q, 0, 10)
            },
            ice: {
                probability: d.t.r < 0 ? 1 : 0,
                quantity: d.t.r > 0 ? 0 : normalizeValue(d.t.r * -1, 0, 5)
            }
        }
        if (i%5==0){
            let forecastIndex=(index/5).toFixed();
            console.error(i+" "+index+" "+forecastIndex+" "+d.t.r);
            forecasts[forecastIndex] = {
                icon: d.w.i,
                temp: d.t.r,
                tempPerc: d.t.p,
                tempUnits: d.t.u
            };
        }
        //console.log(d.d+" - "+d.p.q+" "+d.p.p);
        //console.log(new Date(d.d)+" - "+alerts[index].precipitation.probability+" "+alerts[index].precipitation.quantity);
    }
//    console.log(JSON.stringify(alerts));
memStats(9999);
    if (alertsAvailableCallback) alertsAvailableCallback({
        city: meteoData.c,
        lastUpdate: new Date(meteoData.lu),
        alerts: alerts,
        forecasts: forecasts,
        sunset: meteoData.ss,
        sunrise: meteoData.sr
    });
}

function normalizeValue(value, min, max) {
    let v = value - min;
    let vMax = max - min;
    let res = value / vMax;
//    console.log(`normalizeValue value: v: ${v} min: ${min} max:{max} ${value} vMax: ${vMax} res: ${res}  `);
    if (res < 0) res = 0;
    if (res > 1) res = 1;
    return res;
}
function readDataFromFile(fn) {
    try {
        console.log("readDataFromFile " + fn);
        return JSON.parse(fs.readFileSync(fn, "cbor"));
    } catch (e) {
        logger.error("readDataFromFile throws ex: " + e);
    }
    return null;
}