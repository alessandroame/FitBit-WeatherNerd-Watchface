import * as mediator from "../common/mediator"

const LOGLEVEL_DEBUG = 0;
const LOGLEVEL_INFO = 1;
const LOGLEVEL_WARNING = 2;
const LOGLEVEL_ERROR = 3;
const LOGLEVEL_FATAL = 4;

export function debug(msg) {
    log(LOGLEVEL_DEBUG, msg);
    console.log(msg);
}
export function info(msg) {
    log(LOGLEVEL_INFO, msg);
    console.log(msg);
}
export function warning(msg) {
    log(LOGLEVEL_WARNING, msg)
    console.warn(msg);
}
export function error(msg) {
    log(LOGLEVEL_ERROR, msg)
    console.error(msg);
}
export function fatal(msg) {
    log(LOGLEVEL_FATAL, msg)
    console.error(msg);
}

function log(level, msg) {
    mediator.publish("logEntry", {
        level: level,
        msg: msg
    });
}