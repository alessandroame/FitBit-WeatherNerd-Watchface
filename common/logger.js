
const LOGLEVEL_DEBUG = 0;
const LOGLEVEL_INFO = 1;
const LOGLEVEL_WARNING = 2;
const LOGLEVEL_ERROR = 3;
const LOGLEVEL_FATAL = 4;

let minLevel = LOGLEVEL_INFO;
let cache = "";

export function debug(msg) {
    log(LOGLEVEL_DEBUG, msg);
}
export function info(msg) {
    log(LOGLEVEL_INFO,msg);
}
export function warning(msg) {
    log(LOGLEVEL_WARNING,msg)
}
export function error(msg) {
    log(LOGLEVEL_ERROR,msg)
}

export function fatal(msg) {
    log(LOGLEVEL_FATAL,msg)
}

export function getCache(){
    return cache;
}

function log(level, msg) {
    switch (level) {
        case LOGLEVEL_ERROR:
            console.error(msg);
            break;
        default:
            console.log(msg);
            break;
    }
    var entry = buildLogRow(`${level}:${msg}\n`);
    cache=entry+cache;
    if (cache.length>1000) cache=cache.substr(0,1000);
}

function buildLogRow(msg) {
    let now = new Date();
    let nowString = now.getHours() + ':' + now.getMinutes() + '.' + now.getSeconds();
    return nowString + ' ' + msg;
}