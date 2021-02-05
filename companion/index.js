import { me } from "companion";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import * as mediator from "../common/mediator";
import * as settings from "./settings";
import * as climacell from "./climacell_v4";
import * as geolocator from "./geolocator";
//import * as messaging from "messaging";
import * as logger from "./logger";

let wakeInterval = 5 * 60 * 1000;
let updateMeteoInterval=5;
let updateMeteoTimerID=null;
let currentPosition = null;
let initialized=false;
init();

function init() {
    settings.init();  

    geolocator.init(onPositionChanged);

    console.log("Companion code started");
    mediator.subscribe("requestMeteoUpdate", () => forceUpdate("requested from watch"));
    mediator.subscribe("requestGetCurrentPosition", ()=> geolocator.getCurrentPosition(true));
    settings.subscribe("APIKey", (keys) => { 
        geolocator.getCurrentPosition(true); 
    });
    settings.subscribe("minMeteoUpdateInteval",(value)=>{
        updateMeteoInterval=Math.max(1, value*1);
        geolocator.getCurrentPosition();
        setTimeout(() => {
            startUpdateTimer();
        }, 1000);
    },5);

    me.wakeInterval = wakeInterval;
    me.addEventListener("wakeinterval", () => {
        updateMeteo("wakeinterval triggered");
    });
    me.monitorSignificantLocationChanges = true;
    //me.addEventListener("significantlocationchange", onPositionChanged);
    
    if (!me.permissions.granted("access_location")) {
      settings.set("messageToShow","location_permission_missing");
    }
    settings.subscribe("windDemo",v=>{
        if (initialized) onMeteoAvailable(buildDemoData(5,20,0,0,0,0,settings.get("minWind")*1,settings.get("maxWind")*1,0,180,1100));
    });
    settings.subscribe("precipitationDemo",v=>{
        if (initialized) onMeteoAvailable(buildDemoData(5,20,0,100,0,20,0,0,0,0,4001));
    });
    settings.subscribe("iceDemo",v=>{
        if (initialized) onMeteoAvailable(buildDemoData(4,-8,0,0,0,0,0.0,0,180,1100));
    });
    settings.subscribe("allDemo",v=>{
        if (initialized) onMeteoAvailable(buildDemoData(4,-8,0,100,0,20,settings.get("minWind")*1,settings.get("maxWind")*1,0,180,4001));
    });
    
    initialized=true;
    logger.warning("companion init");
}

function settingLog(msg){
    let log=settings.get("settingLog");
    log=msg+"\n"+log;
    settings.set("settingLog",log);
}
settingLog(new Date());
function startUpdateTimer(){
    if (updateMeteoTimerID){
        console.log("updateMeteoTimer reset");
        clearInterval(updateMeteoTimerID);
        updateMeteoTimerID=null;
    }else{
        forceUpdate("Timer init");
    }
    
    console.log("updateMeteoTimer start ("+updateMeteoInterval+"min)");
    updateMeteoTimerID=setInterval(() => {
        updateMeteo("Timer");
        geolocator.getCurrentPosition();
    },  updateMeteoInterval* 60000);//todo min value should be 5
}


function onPositionChanged(position) {
    console.log("geolocator positionChanged: " + JSON.stringify(position));
    currentPosition = position;
    if (position.coords.forceUpdate){
        forceUpdate("position changed forceUpdate");
    } 
    else {
        updateMeteo("position changed");
    }
    currentPosition.coords.forceUpdate=null;
    settings.set("_currentPosition", JSON.stringify(position));
}

function updateMeteo(reason) {
    throttle(() => {
        forceUpdate(reason);
    }, updateMeteoInterval * 60000,"update "+reason);
}

function forceUpdate(reason){
    logger.warning("update: "+reason);
    climacell.update(currentPosition).then(onMeteoAvailable).catch(onMeteoError);
}

function onMeteoError(error){
    logger.error("onMeteoError: "+JSON.stringify(error));
}

function buildDemoData(tMin,tMax,ppMin,ppMax,piMin,piMax,wsMin,wsMax,wdMin,wdMax,wc){
    let res=null;
    let now=new Date();
    let sr=new Date().setHours(now.getHours()-2)
    let ss=new Date().setHours(now.getHours()+2);
    try{ 
        res={ 
            lu: now,
            sr: sr,
            ss: ss,
            data:[]
        };
        let k=1/30;
        for (let i=0;i<60;i++){
            let n=i<30?i:59-i;
            let d=new Date();
            d.setMinutes(now.getMinutes()+12*i);
            
//            console.log("???????????",ppMin,ppMax,ppMin+(ppMax-ppMin)*k*n);

            res.data.push({
                d: d,
                t: tMin+(tMax-tMin)*k*n,
                pp: ppMin+(ppMax-ppMin)*k*n,
                pi: piMin+(piMax-piMin)*k*n,
                wc: wc,
                ws: Math.floor(wsMin+(wsMax-wsMin)*k*n),
                wd: wdMin+(wdMax-wdMin)*k*n
            });
        }
    }catch(e){
        logger.error("BuildDemoData throws: "+e);
    }
    return res;
}

function onMeteoAvailable(data) {
    logger.debug("onMeteoAvailable begin");
    let json = JSON.stringify(data);    
//    console.warn(json);
    outbox
        .enqueue("meteo_data.json", encode(json)).then((ft) => {
            logger.debug(`onMeteoAvailable ${ft.name} successfully queued.`);
        })
        .catch((error) => {
            logger.error(`onMeteoAvailable Failed write file: ${error}`);
        });
}

let throttleTimer = null;
function throttle(func, delay,msg) {
    if (throttleTimer) { console.log("throttled "+msg); return; }
    throttleTimer = setTimeout(() => { throttleTimer = null; func(); }, delay);
}
