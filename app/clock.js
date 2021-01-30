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
let restTimer=null;
let canRest=false;
export function setRest(){
  if (restTimer) clearTimeout(restTimer);
  canRest=false;
  restActive=true;
  let angle=135;
  let duration=0.5;
  updateHand(secHand,secHandShadow,angle,duration);
  updateHand(minHand,minHandShadow,angle,duration);
  updateHand(hourHand, hourHandShadow,angle,duration);
  restTimer=setTimeout(()=>{
    restTimer=null;
    if (canRest) resetRest();
    canRest=true;
  },1500);
}
export function resetRest(){
  //console.log(canRest+" "+(restTimer));
  canRest=true;
  if (restTimer) return;

  oldHours=null;
  oldMins=null;
  oldSecs=null;
  restActive=false;
  updateClock();
}

export function init() {
  //console.log("clock init");
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
    updateHand(hourHand,hourHandShadow,geom.hoursToAngle(hours, mins),1);
    updateHand(minHand,minHandShadow,geom.minutesToAngle(mins),1);
    oldMins = mins;
  }
  if (oldSecs != secs) { 
    //console.log("sec: "+secs+ " a: "+geom.secondsToAngle(secs));
    updateHand(secHand,secHandShadow,geom.secondsToAngle(secs),0.5,true);
    oldSecs = secs;
  }
}

function updateHand(hand,handShadow,angle,duration,logEnabled){
  animate(hand,angle,duration,logEnabled);
  if (restActive){
    handShadow.style.opacity=0;
    setTimeout(()=>{
      handShadow.groupTransform.rotate.angle = angle;
      handShadow.style.opacity=0.5;}
     ,duration*1000);
  } else{
    handShadow.style.opacity=0.5;
    animate(handShadow,angle,duration);
  }
}

function animate(element,toAngle,duration,logEnabled){
  let animation=element.getElementById("animation");
  animation.animate("disable");
  let fromAngle =element.groupTransform.rotate.angle;
  if (fromAngle<0) fromAngle=360-fromAngle;
  if (fromAngle>360) fromAngle=fromAngle-360;
  let cwDist=Math.abs(toAngle-fromAngle);
  let ccwDist=360-cwDist;
  //if (logEnabled)console.log("from: "+fromAngle+" to:"+toAngle+" dx: "+cwDist+" sx: "+ccwDist);
  if (cwDist<ccwDist) {//clockwise
    //if (logEnabled)console.log("cw");
  }else{ //counter clockwise
    toAngle=fromAngle+ccwDist;
    //if (logEnabled) console.log("ccw "+toAngle);
  }
  //console.log(fromAngle+" > "+toAngle);
  //console.log(from+","+a); 
  animation.dur=duration;
  animation.from=fromAngle;
  animation.to=toAngle;
  element.animate("enable");
}