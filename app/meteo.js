import { inbox } from "file-transfer"
import * as fs from "fs"
import { vibration } from "haptics"
import * as logger from "./logger"
import * as geom from '../common/geom'
import { memory } from "system";
import * as settings from "./settings"
import document from "document";
import { display } from "display";

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

function memStats(desc) {
    let msg = `MEM:${(memory.js.used / memory.js.total * 100).toFixed(1)}% ${desc}`;
    console.log(msg);
    return msg;
}
let alertsAvailableCallback = null;
const METEO_FN = "meteo_data.json";
let initialized=false;
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
    initialized=true;
}

settings.subscribe("messageToShow",(v)=>{setError(v);});

settings.subscribe("minWind",(v)=>{if (initialized) fetchMeteo();});
settings.subscribe("maxWind",(v)=>{if (initialized) fetchMeteo();});

function setError(error){
    if (!error || error.length==0) {
        console.log("resetError");
        resetError();
    }else{
        console.log("setError: "+error);
        document.getElementById("error").href="errors/"+error+".png";
        document.getElementById("alerts").style.display="none";
        document.getElementById("error").style.display="inline";
        document.getElementById("error").animate("enable");
        display.poke();
        vibration.start("bump");
    }
}
function resetError(){
    document.getElementById("error").animate("disable");
    document.getElementById("error").style.display="none";
    document.getElementById("alerts").style.display="inline";
}

export function fetchMeteo() {
    memStats("FetchMeteo BEGIN");
    if (memory.js.used / memory.js.total>0.8){
        console.warn("fetchMeteo skipped due to memory pressure");
        return;
    }
    
    console.warn("fetchMeteo");
    let mode=settings.get("meteoMode");
    let windMode=settings.get("windMode");
    console.log("meteo fetchMeteo");
    let alerts = [];
    let forecasts = [];
    let nextHourProbabilities={ ice:0,prec:0,wind:0};
    let meteoData = readDataFromFile(METEO_FN);
    if (meteoData==null) {
        settings.set("messageToShow","waiting_for_smartphone");
        return;
    }
    if (!meteoData || !meteoData.data){
        //settings.set("messageToShow","unknown_error");
        return;
    }
    
    settings.set("messageToShow","");
    
    memStats("FetchMeteo BEFORE parse");

    let dt=new Date(meteoData.data[0].d);
    let angle=geom.hoursToAngle(dt.getHours(),dt.getMinutes());
    let offset=Math.floor(angle/360*60);
    let minWind=settings.get("minWind");
    let maxWind=settings.get("maxWind");
    for (let i=0;i<meteoData.data.length;i++){
        let d=meteoData.data[i];
        let index=i+offset;
        if (index>59) index=index-60;
        alerts[index]={
            wind: {
                s:normalizeValue(d.ws,minWind,maxWind,true),
                g:normalizeValue(d.wg,minWind,maxWind,true)
            },
            prec: {
                p: normalizeValue(d.pp,0,100),
                q: normalizeValue(d.pi, 0, 10)
            },
            ice: {
                p: d.t < 0 ? d.t/(-2): 0,
                q: d.t > 0 ? 0 : normalizeValue(d.t * -1, 0, 5)
            }
        }
        if (i>=0 && i<=5){
            nextHourProbabilities.ice=Math.max(nextHourProbabilities.ice,alerts[index].ice.q);
            nextHourProbabilities.prec=Math.max(nextHourProbabilities.prec,alerts[index].prec.p);
            nextHourProbabilities.wind=Math.max(nextHourProbabilities.wind,alerts[index].wind.s);
        }

        if (i%5==0){
            let forecastIndex=Math.floor(index/5);
            //console.error(i+" "+offset+" "+index+" "+forecastIndex+" "+d.t.r);
            forecasts[forecastIndex] = {
                icon: iconName(d.wc,d.d,meteoData.sr,meteoData.ss),
                temp: d.t,
                windSpeed: d.ws,
                windGust: d.wg,
                windDirection:d.wd
            };
            //console.warn(JSON.stringify(d));
        }
        //console.log(d.d+" - "+d.p.q+" "+d.p.p);
        //console.log(new Date(d.d)+" - "+alerts[index].prec.probability+" "+alerts[index].prec.quantity);
    }
    //console.log(JSON.stringify(alerts));
    
    memStats("FetchMeteo AFTER parse");
        if (alertsAvailableCallback){
            setTimeout(()=>{
                alertsAvailableCallback({
                lastUpdate: new Date(meteoData.lu),
                alerts: alerts,
                nextHourProbabilities: nextHourProbabilities, 
                forecasts: forecasts,
                sunset: meteoData.ss,
                sunrise: meteoData.sr
            },mode,windMode);
        },1);
    }
    memStats("FetchMeteo END");
}
    
function iconName(code, dt,sr,ss) {
    let isDay =(dt < ss) && (ss<sr || dt>sr);
    let res = weatherIcons["_"+code];
    let i = dayNightIcons.indexOf(res);
    if (i != -1) res += (isDay ? "_day" : "_night");
    //console.warn("-----------",code,dt,sr,ss,res,isDay);
    return res;
}

function normalizeValue(value, min, max,showLog) {
    let v = value - min;
    let vMax = max - min;
    let res = v / vMax;
    //if (showLog) console.log(`normalize value: ${value} vo: ${v} min: ${min} max:${max}  vMax: ${vMax} res: ${res}  `);
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