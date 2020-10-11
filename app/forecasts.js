import document from "document";

export function init() {
    console.log("forecast init")
    var touch = document.getElementById("touch");
    touch.onclick = () => { document.history.back(); };
    for (var i = 0; i < 12; i++) {
        try {
            var f = document.getElementById("forecast_" + i);
            var mainContainer = f.getElementById("mainContainer");
            var iconContainer = mainContainer.getElementById("iconContainer");
            var tempContainer = mainContainer.getElementById("tempContainer");
            mainContainer.groupTransform.rotate.angle = i * 30;
            iconContainer.groupTransform.rotate.angle = -i * 30;
            tempContainer.groupTransform.rotate.angle = -i * 30;
        } catch (e) {
            console.error("initForecastView fails:" + e);
            console.trace();
        }
    }
    if (forecasts) redraw();
}

let forecasts = null;
export function setData(data) {
    forecasts = data;
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

    }
}
function parseTemp(v) {
    if (v < 0 && v > -1) v = 0;
    return v.toFixed(0);
}
