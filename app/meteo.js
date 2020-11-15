import { inbox } from "file-transfer"
import * as fs from "fs"
import { vibration } from "haptics"
import * as logger from "./logger"
import * as geom from '../common/geom'


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
    let alerts = [];
    let forecasts = [];
    let meteoData = readDataFromFile(METEO_FN);
    if (!meteoData) return;
    //console.log(JSON.stringify(meteo));
    let dt=new Date(meteoData.data[0].d);
    let angle=geom.hoursToAngle(dt.getHours(),dt.getMinutes());
    var offset=(angle/360*60).toFixed()*1;
    for (let i=0;i<meteoData.data.length;i++){
        let d=meteoData.data[i];
        let index=i+offset;
        if (index>59) index=index-60;
        alerts[index]={
            precipitation: {
                probability: normalizeValue(d.p.p, 0, 100),
                quantity: normalizeValue(d.p.q, 0, 10)
            },
            ice: {
                probability: d.t.r < 0 ? 1 : 0,
                quantity: d.t.r > 0 ? 0 : normalizeValue(d.t.r * -1, 0, 5)
            }
        }
        if (i%5==0){
            forecasts[i/5] = {
                icon: d.w.i,
                temp: d.t.r,
                tempPerc: d.t.p,
                tempUnits: d.t.u
            };
        }
        //console.log(d.d+" - "+d.p.q+" "+d.p.p);
        //console.log(new Date(d.d)+" - "+alerts[index].precipitation.probability+" "+alerts[index].precipitation.quantity);
    }
    console.log(JSON.stringify(alerts));
    var data = {
        city: meteoData.c,
        lastUpdate: new Date(meteoData.lu),
        alerts: alerts,
        forecasts: forecasts,
        sunset: meteoData.ss,
        sunrise: meteoData.sr
    };
    logger.debug("meteo load " + data.city + "@" + data.lastUpdate);
    if (alertsAvailableCallback) alertsAvailableCallback(data);
}

function findFirst(data, d, precision) {
    let ts=d.getTime();
    for (let i = 0; i < data.length; i++) {
        if (data[i].d.getTime()+precision*60*1000 > ts) {
//            console.error(data[i].d,d)
//            console.error(data[i].d.getTime()+precision*60 ,ts)
            return data[i];
        }
        //console.warn(data[i].d.getTime()+precision*60 ,ts)
    }
    return null;
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
        let json = fs.readFileSync(fn, "cbor");
        let data = JSON.parse(json);
        return data;
    } catch (e) {
        logger.error("readDataFromFile throws ex: " + e);
    }
    return null;
}