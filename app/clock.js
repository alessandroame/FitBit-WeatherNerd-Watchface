import clock from "clock";
import * as datum from "./datum"
import document from "document";
import * as settings from "./settings"
import * as geom from './geom'

let clockContainer = document.getElementById("clock");
let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");
let center = document.getElementById("center");

settings.subscribe("secondsHandColor",(value)=>{
  console.log("seconds hand color: "+value);
  secHand.getElementById("hand").style.fill=value;
  center.style.fill=value;
},"red");

settings.subscribe("minutesHandColor",(value)=>{
  console.log("minutes hand color: "+value);
  minHand.getElementById("hand").style.fill=value;
},"white");

settings.subscribe("hoursHandColor",(value)=>{
  console.log("hours hand color: "+value);
  hourHand.getElementById("hand").style.fill=value;
},"white");

clock.granularity = "seconds";
clock.addEventListener("tick", updateClock);


export function init(){
  console.log("clock init");
  datum.init();
}

export function show(){
  clockContainer.style.display="inline";
}
export function hide(){
  clockContainer.style.display="none";
}

// let dimmerTimer;
// function showClockData() {
//     datum.widget.style.opacity = 1;
//     statusMessage.style.opacity = 1;

//     if (dimmerTimer) {
//         clearTimeout(dimmerTimer);
//         dimmerTimer = null;
//         dimClockData();
//     } else {
//         dimmerTimer = setTimeout(() => { dimClockData() }, 5000);
//     }
// }

// function dimClockData() {
//     let dimmedOpacity = 0.3;
//     datum.widget.style.opacity = dimmedOpacity;
//     statusMessage.style.opacity = dimmedOpacity;
// }

function updateClock() {
  let now = new Date();
  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();

  hourHand.groupTransform.rotate.angle = geom.hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = geom.minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = geom.secondsToAngle(secs);
}
