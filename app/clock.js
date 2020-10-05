import clock from "clock";
import document from "document";
import * as logger from "../common/logger";
import * as settings from "./settings"

let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");
let center = document.getElementById("center");

settings.subscribe("secondsHandColor",(value)=>{
  logger.debug("seconds hand color: "+value);
  secHand.getElementById("hand").style.fill=value;
  center.style.fill=value;
});

settings.subscribe("minutesHandColor",(value)=>{
  logger.debug("minutes hand color: "+value);
  minHand.getElementById("hand").style.fill=value;
});

settings.subscribe("hoursHandColor",(value)=>{
  logger.debug("hours hand color: "+value);
  hourHand.getElementById("hand").style.fill=value;
});

clock.granularity = "seconds";
clock.addEventListener("tick", updateClock);


export function init(){
  logger.debug("clock init");
}

function updateClock() {
  let now = new Date();
  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);
}

function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}
