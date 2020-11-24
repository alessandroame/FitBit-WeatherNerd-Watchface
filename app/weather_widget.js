import document from "document";

export function update(meteo){
    let currentWeather=meteo.forecasts[0];
//    console.error(JSON.stringify(currentWeather));
    let container = document.getElementById("currentWeather");
    let icon = container.getElementById("icon");
    icon.href = "icons/meteo/" + currentWeather.icon + ".png";
    let temp = container.getElementById("temp");
    temp.textContent = parseTemp(currentWeather.temp) + currentWeather.tempUnits;
}
function parseTemp(v) {
    if (v < 0 && v > -1) v = 0;
    return v.toFixed();
}