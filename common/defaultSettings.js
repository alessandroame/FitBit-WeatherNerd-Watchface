export function get(key){
    if (defaultValues[key]!=null) return defaultValues[key];
    console.error("Default value not found: "+key);
    return null;
}

export let defaultValues={
    "_hiBatteryReadTime":0,
    "_hiBatteryLevel":0,
    "automaticBackgroundColor":"true",
    "messageToShow":"",
    "batteryColor":"dodgerblue",
    "clockBackgroundColor":"darkgrey",
    "clockDialHoursColor":"white",
    "datumBackgroundColor":"black",
    "datumDayColor":"white",
    "fitDataColor":"lightgrey",
    "fitWidgetBackgroundColor":"black",
    "goalColor":"dodgerblue",
    "hoursHandColor":"white",
    "minutesHandColor":"white",
    "secondsHandColor":"red",
    "weatherBackgroundColor":"black",
    "weatherWidgetColor":"white",
    "datumDOWColor":"dodgerblue",
    "clockDialMinutesColor":"grey",
 
    "_dialGraphic":JSON.stringify({"selected":[1],"values":[{ name: "Small hexagon pattern", value: "small_hex" }]}),
    "dialGraphic": "small_hex",
 
    "_logLevel":JSON.stringify({"selected":[2],"values":[{ name: "Warning", value: "2" }]}),
    "logLevel": "2",

    "minWind":5,
    "maxWind":20,

    "_tempUOM":JSON.stringify({"selected":[0],"values":[{ name: "Celius", value: "C" }]}),
    "tempUOM":"C",

    "_speedUOM":JSON.stringify({"selected":[0],"values":[{ name: "m/s", value: "m/s" }]}),
    "speedUOM":"m/s",

    "meteoMode":0,
    "windMode":0,
    "vibrateOnConnectionLost":"true",
    "snoozeDialogEnabled":"true",

    "_snoozeDelayMinutes":JSON.stringify({"selected":[1],"values":[{ name: "2 minutes", value: "2" }]}),
    "snoozeDelayMinutes":2,

    "_minMeteoUpdateInteval":JSON.stringify({"selected":[4],"values":[{ name: "10 minutes", value: "10" }]}),
    "minMeteoUpdateInteval":10,

    "_elementToUpdate":JSON.stringify({"selected":[5],"values":[{ name: "Clock background", value: "clockBackgroundColor" }]}),
    "elementToUpdate":"clockBackgroundColor",
 
    "_elementColor":JSON.stringify({"selected":[2],"values":[{ color: 'grey' }]}),
   "elementColor":"darkgrey"
} 