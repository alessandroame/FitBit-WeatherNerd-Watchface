import clock from "clock";
import * as datum from "./datum"
import document from "document";
import * as settings from "./settings"
import * as geom from '../common/geom'

let clockContainer = document.getElementById("clock");
let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");

let hourHandShadow = clockContainer.getElementById("hoursShadow");
let minHandShadow = clockContainer.getElementById("minsShadow");
let secHandShadow = clockContainer.getElementById("secsShadow");

settings.subscribe("clockBackgroundColor", (color) => {
  //  document.getElementById("clockBackground").gradient.colors.c1 = color;
  document.getElementById("clockBackgroundGradient").style.fill = color;
}, "#333333");

settings.subscribe("clockDialHoursColor", (color) => {
  document.getElementById("clockDialHours").style.fill = color;
 }, "#333333");

settings.subscribe("clockDialMinutesColor", (color) => {
  document.getElementById("clockDialMinutes").style.fill = color;
}, "#333333");

settings.subscribe("secondsHandColor", (value) => {
  console.log("seconds hand color: " + value);
  secHand.style.fill = value;
}, "red");

settings.subscribe("minutesHandColor", (value) => {
  console.log("minutes hand color: " + value);
  minHand.style.fill = value;
}, "white");

settings.subscribe("hoursHandColor", (value) => {
  console.log("hours hand color: " + value);
  hourHand.style.fill = value;
}, "white");

clock.granularity = "seconds";
clock.addEventListener("tick", updateClock);

export function init() {
  console.log("clock init");
  datum.init();
}

export function show() {
  clockContainer.style.display = "inline";
}
export function hide() {
  clockContainer.style.display = "none";
}
let oldHours, oldMins, oldSecs;
function updateClock() {
  let now = new Date();
  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();
  if (oldHours != hours) {
    let a = geom.hoursToAngle(hours, mins);
    //console.log("hours update " + a);
    hourHand.groupTransform.rotate.angle = a;
    hourHandShadow.groupTransform.rotate.angle = a;
    oldHours = hours;
  }
  if (oldMins != mins) {
    var a = geom.minutesToAngle(mins);
    //console.log("minutes update " + a);
    minHand.groupTransform.rotate.angle = a;
    minHandShadow.groupTransform.rotate.angle = a;
    oldMins = mins;
  }
  if (oldSecs != secs) {
    var a = geom.secondsToAngle(secs);
    //console.log("seconds update " + a);
    secHand.groupTransform.rotate.angle = a;
    secHandShadow.groupTransform.rotate.angle = a;
    oldSecs = secs;
  }
}