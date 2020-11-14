import * as settings from "./settings";
import * as logger from "./logger";
import { locale } from "user-settings";
let apiKey = null;
settings.subscribe("APIKey", (key) => { apiKey = key; });

export function update(pos) {
    return new Promise((resolve, reject) => {
        if (!pos || !pos.coords) {
            logger.error("climacell -> position not available");
            return;
        }
        if (!apiKey) {
            logger.error("apikey not available");
            return;
        }
        let startTime = new Date();
        let endTime = new Date();
        endTime.setHours(startTime.getHours() + 12);

        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;
        Promise.all([
            getCity(lat, lon),
            getPresent(lat, lon),
            getNowcast(lat, lon),
            getForecast(startTime, endTime, lat, lon)
        ])
            .then((values) => {
                var res = buildData(values[0], values[1], values[2], values[3]);
                //console.log("res",JSON.stringify(res));
                resolve(res);
            });
    });
}

function buildData(city, present, nowcast, forecast) {
    let data = [];
    let now = new Date();
    /*console.log("present "+JSON.stringify(present));
    console.log("nowcast "+JSON.stringify(nowcast));
    console.log("forecast "+JSON.stringify(forecast));*/
    //return;
    for (let i = 0; i < 60; i++) {
        let current = null;
        if (i == 0) {
            current = present;
        } else {
            current = findFirst(nowcast, now, 12) ?? findFirst(forecast, now, 60);
        }
        data.push(current);
        now.setMinutes(now.getMinutes() + 12);
    }
    let res = {
        c: city,
        sr: new Date(forecast[forecast.length - 1].sr),
        ss: new Date(forecast[forecast.length - 1].ss),
        data: data
    }
    return res;
}

function findFirst(data, d, precision) {
    let ts=d.getTime();
    for (let i = 0; i < data.length; i++) {
        if (data[i].d.getTime()+precision*60*1000 > d) return data[i];
    }
    return null;
}

function getCity(lat, lon) {
    return new Promise((resolve, reject) => {
        var url = "https://nominatim.openstreetmap.org/reverse?&lat=" + lat + "&lon=" + lon + "&format=json";
        fetch(url)
            .then(function (response) {
                response.json()
                    .then(function (data) {
                        //console.log(JSON.stringify(data));
                        var a = data.address;
                        var res = a["village"] || a["town"] || a["city"] || a["suburb"] || a["county"] || a["state"] || a["country"];
                        resolve(res);
                        //logger.warning("city response: " + res);
                    });
            })
            .catch(function (err) {
                logger.error("Error fetching city for lat: " + lat + " lon:" + lon + " -> " + err);
                reject(err);
            });
    });
}

function getPresent(lat, lon) {
    return new Promise((resolve, reject) => {
        try {
            var url = "https://api.climacell.co/v3/weather/realtime?" +
                "apikey=" + apiKey +
                "&unit_system=" + settings.get("unitSystem", locale.temperature == "C" ? "si" : "us") +
                "&lat=" + lat +
                "&lon=" + lon +
                "&fields=sunrise,sunset,weather_code,precipitation,precipitation_type,temp,feels_like,wind_speed,wind_gust,wind_direction";
            console.log("climacell present " + url);
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/JSON"
                }
            })
                .then(function (res) {
                    res.json()
                        .then(data => {
                            if (data.message) {
                                logger.error(`getPresent error: ${JSON.stringify(data)} `);
                            } else {
                                resolve(parseWeather(data, new Date()));
                            }
                        });
                })
                .catch(function (err) {
                    logger.error("getPresent exception: " + err);
                });
        } catch (e) {
            reject(e);
        }
    });
}

function getNowcast(lat, lon) {
    return new Promise((resolve, reject) => {
        try {
            var url = "https://api.climacell.co/v3/weather/nowcast?" +
                "apikey=" + apiKey +
                "&unit_system=" + settings.get("unitSystem", locale.temperature == "C" ? "si" : "us") +
                "&lat=" + lat +
                "&lon=" + lon +
                "&start_time=now" +
                "&timestep=12" +
                "&fields=sunrise,sunset,weather_code,precipitation,precipitation_type,temp,feels_like,wind_speed,wind_gust,wind_direction";
            console.log("nowcast update " + url);
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/JSON"
                }
            })
                .then(function (res) {
                    //console.log(`res code: ${res.status} ${res.statusText}  `);
                    res.json()
                        .then(data => {
                            if (data.message) {
                                logger.error(`getNowcast error: ${JSON.stringify(data)} `);
                            } else {
                                var res = [];
                                for (var i = 0; i < data.length; i++) res.push(parseWeather(data[i]));
                                resolve(res);
                            }
                        });
                })
                .catch(function (err) {
                    logger.error("getNowcast exception: " + err);
                });
            console.error("getNowcast resolved");
        } catch (e) {
            reject(e);
        }
    });
}

function getForecast(startTime, endTime, lat, lon) {
    return new Promise((resolve, reject) => {
        try {
            var url = "https://api.climacell.co/v3/weather/forecast/hourly?" +
                "apikey=" + apiKey +
                "&unit_system=" + settings.get("unitSystem", locale.temperature == "C" ? "si" : "us") +
                "&lat=" + lat +
                "&lon=" + lon +
                "&start_time=" + startTime.toISOString() +
                "&end_time=" + endTime.toISOString() +
                "&fields=sunrise,sunset,weather_code,precipitation,precipitation_probability,precipitation_type,temp,feels_like,wind_speed,wind_gust,wind_direction";
            console.log("climacell update " + url);
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/JSON"
                }
            })
                .then(function (res) {
                    //console.log(`res code: ${res.status} ${res.statusText}  `);
                    res.json()
                        .then(data => {
                            if (data.message) {
                                logger.error(`getForecast error: ${JSON.stringify(data)} `);
                            } else {
                                var res = [];
                                for (var i = 0; i < data.length; i++) {
                                    res.push(parseWeather(data[i]));
                                }
                                resolve(res);
                            }
                        });
                })
                .catch(function (err) {
                    logger.error("getForecast exception: " + err);
                });
            console.error("Forecast resolved");
        } catch (e) {
            reject(e);
        }
    });
}


function parseWeather(data, time) {
    let dt = new Date(time ?? data.observation_time.value);
    let sr = new Date(data.sunrise.value);
    let ss = new Date(data.sunset.value);
    let isDay = (dt > sr) && (dt < ss);
    return {
        sr: sr,
        ss: ss,
        d: dt,
        id: isDay,
        t: {//temp
            r: data.temp.value,
            p: data.feels_like.value,
            u: data.temp.units.replace("C", "°")
        },
        p: {//precipitation
            t: data.precipitation_type.value,
            p: data.precipitation_probability?.value ?? 1,
            q: data.precipitation.value
        },
        w: {//weather
            i: iconName(data.weather_code.value, isDay)
        }
    };
}

let dayNightIcons = ["clear", "mostly_clear", "partly_cloudy"];
function iconName(code, isDay) {
    let i = dayNightIcons.indexOf(code);
    let res = code;
    if (i != -1) res += (isDay ? "_day" : "_night");
    //console.log(res,isDay);
    return res;
}