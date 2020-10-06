const LOGLEVEL_DEBUG = 0;
const LOGLEVEL_INFO = 1;
const LOGLEVEL_WARNING = 2;
const LOGLEVEL_ERROR = 3;
const LOGLEVEL_FATAL = 4;
let levelDescriptions = ["D", "I", "W", "E", "F"];
let cache = "";
export let minLevel = LOGLEVEL_INFO;

export function debug(msg) {
    log(LOGLEVEL_DEBUG, msg);
}
export function info(msg) {
    log(LOGLEVEL_INFO, msg);
}
export function warning(msg) {
    log(LOGLEVEL_WARNING, msg)
}
export function error(msg) {
    log(LOGLEVEL_ERROR, msg)
}

export function fatal(msg) {
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
    return cache="";
}

function log(level, msg) {
    if (level < minLevel) return;
    var entry = buildLogRow(`${levelDescriptions[level]}:${msg}\n`);
    cache = entry + cache;
    if (cache.length > 1000) cache = cache.substr(0, 1000);
}

function buildLogRow(msg) {
    let now = new Date();
    let nowString = now.getHours() + ':' + now.getMinutes();// + '.' + now.getSeconds();
    return nowString + ' ' + msg;
}