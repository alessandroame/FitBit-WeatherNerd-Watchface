import clock from "clock";
import * as datum from "./datum"
import document from "document";
import * as settings from "./settings"
import * as geom from '../common/geom'
import { update } from "./meteo_alerts";

let oldHours, oldMins, oldSecs;

let clockContainer = document.getElementById("clock");
let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");

let hourHandShadow = clockContainer.getElementById("hoursShadow");
let minHandShadow = clockContainer.getElementById("minsShadow");
let secHandShadow = clockContainer.getElementById("secsShadow");

settings.subscribe("clockBackgroundColor", (color) => {
  //  document.getElementById("clockBackground").gradient.colors.c1 = color;
  document.getElementById("dialGraphic").style.fill = color;
});
settings.subscribe("dialGraphic", (value) => {
  //  document.getElementById("clockBackground").gradient.colors.c1 = color;
  document.getElementById("dialGraphic").href="background_"+value+".png";
});

settings.subscribe("clockDialHoursColor", (color) => {
  document.getElementById("clockDialHours").style.fill = color;
 });

settings.subscribe("clockDialMinutesColor", (color) => {
  document.getElementById("clockDialMinutes").style.fill = color;
}, "#333333");

settings.subscribe("secondsHandColor", (value) => {
  //console.log("seconds hand color: " + value);
  secHand.style.fill = value;
});

settings.subscribe("minutesHandColor", (value) => {
//  console.log("minutes hand color: " + value);
  minHand.style.fill = value;
});

settings.subscribe("hoursHandColor", (value) => {
  //console.log("hours hand color: " + value);
  hourHand.style.fill = value;
});

clock.granularity = "seconds";
clock.addEventListener("tick", updateClock);

let restActive=false;
export function setRest(){
  restActive=true;
  let a=135;
  updateHand(secHand,secHandShadow,a);
  updateHand(minHand,minHandShadow,a);
  updateHand(hourHand, hourHandShadow,a);
}
export function resetRest(){
  restActive=false;
  oldHours=0;
  oldMins=0;
  oldSecs=0;
  updateClock();
}

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

function updateClock() {
  if (restActive) return;
  let now = new Date();
  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();
  // if (oldHours != hours) {
  //   oldHours = hours;
  // }
  if (oldMins != mins) {
    updateHand(hourHand,hourHandShadow,geom.hoursToAngle(hours, mins));
    updateHand(minHand,minHandShadow,geom.minutesToAngle(mins));
    oldMins = mins;
  }
  if (oldSecs != secs) {
    updateHand(secHand,secHandShadow,geom.secondsToAngle(secs));
    oldSecs = secs;
  }
}

function updateHand(hand,handShadow,a){
  try{
    animate(hand,a);
  }catch(e){
    hand.groupTransform.rotate.angle = a;
  }
  try{
    animate(handShadow,a);
  }catch(e){
    handShadow.groupTransform.rotate.angle = a;
  }

}

function animate(element,a){
  var animation=element.getElementById("animation");
  var from =element.groupTransform.rotate.angle-(element.groupTransform.rotate.angle>a?360:0);
  //console.log(from+","+a); 
  animation.from=from;
  animation.to=a;
  element.animate("enable");
}