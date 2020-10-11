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
    if (forecasts) redraw();
    timeoutID = setTimeout(back, 10000);
}

function back() {
    if (timeoutID) {
        clearTimeout(timeoutID);
        timeoutID = null;
    }
    document.history.back();
}

let forecasts = null;
export function setData(data) {
    forecasts = data;
    if (document.getElementById("forecasts")) redraw();
}

function redraw() {
    for (var i = 0; i < 12; i++) {
        var f = document.getElementById("forecast_" + i);
        var mainContainer = f.getElementById("mainContainer");
        //var iconContainer = mainContainer.getElementById("iconContainer");
        var icon = mainContainer.getElementById("icon");
        icon.href = "icons/meteo/" + forecasts[i].icon + ".png";
        var temp = mainContainer.getElementById("temp");
        temp.textContent = parseTemp(forecasts[i].temp) + "°";
        var tempPerc = mainContainer.getElementById("tempPerc");
        tempPerc.textContent = parseTemp(forecasts[i].tempPerc) + "°";

    }
}
function parseTemp(v) {
    if (v < 0 && v > -1) v = 0;
    return v.toFixed(0);
}
