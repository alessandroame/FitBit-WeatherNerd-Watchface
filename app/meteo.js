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
    let alerts = [];
    let forecasts = [];
    let meteoData = readDataFromFile(METEO_FN);
    if (!meteoData) return;
    //console.log(JSON.stringify(meteo));
    let dt=new Date(meteoData.data[0].d);
    let angle=geom.hoursToAngle(dt.getHours(),dt.getMinutes());
    let offset=Math.floor(angle/360*60);
    for (let i=0;i<meteoData.data.length;i++){
        let d=meteoData.data[i];
        //console.warn(JSON.stringify(d));
        let index=i+offset;
        if (index>59) index=index-60;
        alerts[index]={
            precipitation: {
                probability: normalizeValue(d.pp,0,100),
                quantity: normalizeValue(d.pi, 0, 10)
            },
            ice: {
                probability: d.t < 0 ? d.t/(-2): 0,
                quantity: d.t > 0 ? 0 : normalizeValue(d.t * -1, 0, 5)
            }
        }
        if (i%5==0){
            let forecastIndex=Math.floor(index/5);
            //console.error(i+" "+offset+" "+index+" "+forecastIndex+" "+d.t.r);
            forecasts[forecastIndex] = {
                icon: iconName(d.wc,d.d,meteoData.sr,meteoData.ss),
                temp: d.t,
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


let weatherIcons={
	_1000: "clear",
	_1001: "cloudy",
	_1100: "mostly_clear",
	_1101: "partly_cloudy",
	_1102: "mostly_cloudy",
	_2000: "fog",
	_2100: "fog_light",
	_4000: "drizzle",
	_4001: "rain",
	_4200: "rain_light",
	_4201: "rain_heavy",
	_5000: "snow",
	_5001: "flurries",
	_5100: "snow_light",
	_5101: "snow_heavy",
	_6000: "freezing_drizzle",
	_6001: "freezing_rain",
	_6200: "freezing_rain_light",
	_6201: "freezing_rain_heavy",
	_7000: "ice_pellets",
	_7101: "ice_pellets_heavy",
	_7102: "ice_pellets_light",
	_8000: "tstorm"
}
let dayNightIcons = ["clear", "mostly_clear", "partly_cloudy"];
    
function iconName(code, dt,sr,ss) {
    let isDay =(dt < ss) && (ss<sr || dt>sr);
    let res = weatherIcons["_"+code];
    let i = dayNightIcons.indexOf(res);
    if (i != -1) res += (isDay ? "_day" : "_night");
    //console.warn("-----------",code,dt,sr,ss,res,isDay);
    return res;
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