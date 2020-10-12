import document from "document";

let timeoutID = null;
export function init() {
    console.log("forecast init")
    var touch = document.getElementById("touch");
    touch.onclick = () => { back(); };
    for (var i = 0; i < 12; i++) {
        try {
            var f = document.getElementById("forecast_" + i);
            var mainContainer = f.getElementById("mainContainer");
            var iconContainer = mainContainer.getElementById("iconContainer");
            var tempContainer = mainContainer.getElementById("tempContainer");
            var tempPercContainer = mainContainer.getElementById("tempPercContainer");
            mainContainer.groupTransform.rotate.angle = i * 30;
            iconContainer.groupTransform.rotate.angle = -i * 30;
            tempContainer.groupTransform.rotate.angle = -i * 30;
            tempPercContainer.groupTransform.rotate.angle = -i * 30;
        } catch (e) {
            console.error("initForecastView fails:" + e);
            console.trace();
        }
    }
    if (meteo) redraw();
    timeoutID = setTimeout(back, 10000);
}

function back() {
    if (timeoutID) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }
    document.history.back();
}

let meteo = null;
export function setData(data) {
    meteo = data;
    console.log(JSON.stringify(data));
    if (document.getElementById("forecasts")) redraw();
}

function redraw() {
    try {
        let forecasts=meteo.forecasts;
        let d = new Date().getHours();
        if (d > 11) d = d - 12;
        for (var i = 0; i < 12; i++) {
            var f = document.getElementById("forecast_" + i);
            var mainContainer = f.getElementById("mainContainer");


            let dist = i >= d ? i - d : i + 12 - d;
            let o = 0.2 + 0.8 / 12 * (12 - dist);
            mainContainer.style.opacity = o;

            //var iconContainer = mainContainer.getElementById("iconContainer");
            var icon = mainContainer.getElementById("icon");
            icon.href = "icons/meteo/" + forecasts[i].icon + ".png";
            var temp = mainContainer.getElementById("temp");
            temp.textContent = parseTemp(forecasts[i].temp) + forecasts[i].tempUnits;
            var tempPerc = mainContainer.getElementById("tempPerc");
            tempPerc.textContent = parseTemp(forecasts[i].tempPerc) + forecasts[i].tempUnits;
        }

        let sr=new Date(meteo.sunrise);
        let ss=new Date(meteo.sunset);
        document.getElementById("sunriseHand").groupTransform.rotate.angle = hoursToAngle(sr.getHours(),sr.getMinutes());
        document.getElementById("sunsetHand").groupTransform.rotate.angle = hoursToAngle(ss.getHours(), ss.getMinutes());
    } catch (e) {
        console.error(e);
    }
}
function hoursToAngle(hours, minutes) {
    let hourAngle = (360 / 12) * hours;
    let minAngle = (360 / 12 / 60) * minutes;
    return hourAngle + minAngle;
}
function parseTemp(v) {
    if (v < 0 && v > -1) v = 0;
    return v.toFixed(0);
}
