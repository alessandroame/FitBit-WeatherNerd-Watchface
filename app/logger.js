import * as settings from "./settings"
import * as mediator from "../common/mediator"

const LOGLEVEL_DEBUG = 0;
const LOGLEVEL_INFO = 1;
const LOGLEVEL_WARNING = 2;
const LOGLEVEL_ERROR = 3;
const LOGLEVEL_FATAL = 4;
let levelDescriptions = ["D", "I", "W", "E", "F"];
let version="\nv0.0.6\n";
let cache = "STARTED "+version;
export let minLevel = LOGLEVEL_DEBUG;
settings.subscribe("logLevel",(v)=>{minLevel=v;},LOGLEVEL_WARNING);

mediator.subscribe("logEntry",(entry)=>{
    //console.error(JSON.stringify(entry));
    log(entry.level,entry.msg,true);
});

export function debug(msg) {
    console.log(msg);
    log(LOGLEVEL_DEBUG, msg);
}
export function info(msg) {
    console.log(msg);
    log(LOGLEVEL_INFO, msg);
}
export function warning(msg) {
    console.warn(msg);
    log(LOGLEVEL_WARNING, msg)
}
export function error(msg) {
    console.error(msg);
    console.trace();
    log(LOGLEVEL_ERROR, msg)
}

export function fatal(msg) {
    console.error(msg);
    log(LOGLEVEL_FATAL, msg)
}

export function getCache(page) {
    if (!page) page=0;
    let pageSize=100;
    let startPos=page*pageSize;
    let canUp=page>0;
    let canDown=cache.length-20>startPos;
    if (!canDown) startPos=cache.length-20;

    let content=(startPos==0?"":"...")+cache.substr(startPos);
    return {
        canUp:canUp,
        canDown:canDown,
        content:content
    }
}

export function reset() {
    return cache="reset "+version;
}

function log(level, msg,fromCompanion) {
    if (level < minLevel) return;
    let now = new Date();

    let nowString = now.getHours() + ':' + now.getMinutes() + '.' + now.getSeconds();
//    let entry = `${nowString} ${msg}\n`;
    let entry = `${fromCompanion?"C":"A"} ${levelDescriptions[level]} ${nowString} > ${msg}\n`;
    cache = entry + cache;
    if (cache.length > 1000) cache = cache.substr(0, 1000);
}