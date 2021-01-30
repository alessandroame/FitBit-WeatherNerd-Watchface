export function get(key){
    if (defaultSettings[key]!=null) return defaultSettings[key];
    console.error("Default value not found: "+key);
    return null;
}

let defaultSettings={
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
    "dialGraphic":"small_hex",
    "clockDialMinutesColor":"grey",
    "logLevel":"2",
    "minWind":"5",
    "maxWind":"20",
    "unitSystem":"si",
    "meteoMode":0,
    "vibrateOnConnectionLost":true,
    "snoozeDialogEnabled":true,
   /* "":"",
    "":"",
    "":"",*/
}