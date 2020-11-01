import clock from "clock";
import * as datum from "./datum"
import document from "document";
import * as settings from "./settings"
import * as geom from './geom'

let clockContainer = document.getElementById("clock");
let hands = clockContainer.getElementById("hands");
let hourHand = hands.getElementById("hours");
let minHand = hands.getElementById("mins");
let secHand = hands.getElementById("secs");
let center = hands.getElementById("center");

let handsShadow = clockContainer.getElementById("handsShadow");
let hourHandShadow = handsShadow.getElementById("hours");
let minHandShadow = handsShadow.getElementById("mins");
let secHandShadow = handsShadow.getElementById("secs");
let centerShadow = handsShadow.getElementById("center");


let layer = 98;
secHand.layer = layer--;
secHandShadow.layer = layer--;

minHand.layer = layer --;
minHandShadow.layer = layer --;

hourHand.layer = layer --;
hourHandShadow.layer = layer --;


settings.subscribe("clockBackgroundColor", (color) => {
  document.getElementById("background").gradient.colors.c1 = color;
}, "#333333");

settings.subscribe("clockDialHoursColor", (color) => {
  document.getElementById("clockDialHours").style.fill = color;
}, "#333333");

settings.subscribe("clockDialMinutesColor", (color) => {
  document.getElementById("clockDialMinutes").style.fill = color;
}, "#333333");

settings.subscribe("secondsHandColor", (value) => {
  console.log("seconds hand color: " + value);
  secHand.getElementById("hand").style.fill = value;
}, "red");

settings.subscribe("minutesHandColor", (value) => {
  console.log("minutes hand color: " + value);
  minHand.getElementById("hand").style.fill = value;
}, "white");

settings.subscribe("hoursHandColor", (value) => {
  console.log("hours hand color: " + value);
  hourHand.getElementById("hand").style.fill = value;
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

function updateClock() {
  let now = new Date();
  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();

  hourHand.groupTransform.rotate.angle = geom.hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = geom.minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = geom.secondsToAngle(secs);

  hourHandShadow.groupTransform.rotate.angle = geom.hoursToAngle(hours, mins);
  minHandShadow.groupTransform.rotate.angle = geom.minutesToAngle(mins);
  secHandShadow.groupTransform.rotate.angle = geom.secondsToAngle(secs);
}
