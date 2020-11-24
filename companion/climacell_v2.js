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
                // for (let i=0;i<values[2].length;i++){
                //     let r=values[2][i];
                //     console.warn(r.d+" "+r.t.r+"  "+r.p.p+" "+r.p.q);
                // }
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
        lu: new Date(),
        sr: new Date(forecast[forecast.length - 1].sr),
        ss: new Date(forecast[forecast.length - 1].ss),
        data: data
    }
    //console.error(JSON.stringify(res));
    return res;
}

function findFirst(data, d, precision) {
    let ts = d.getTime();
    for (let i = 0; i < data.length; i++) {
        if (data[i].d.getTime() + precision * 60 * 1000 > ts) {
            //            console.error(data[i].d,d)
            //            console.error(data[i].d.getTime()+precision*60 ,ts)
            return data[i];
        }
        //console.warn(data[i].d.getTime()+precision*60 ,ts)

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
                        try {
                    //console.log(JSON.stringify(data));
                        var a = data.address;
                        var res = a["village"] || a["town"] || a["city"] || a["suburb"] || a["county"] || a["state"] || a["country"];
                        resolve(res);
                        //logger.warning("city response: " + res);
                    } catch (err) {
                        logger.error("getForecast exception: " + err);
                        resolve("unknown location");
                    }
                });
            })
            .catch(function (err) {
                logger.error("Error fetching city for lat: " + lat + " lon:" + lon + " -> " + err);
                resolve("unknown location");
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
                    logger.error("getPresent ex: " + err);
                });
        } catch (e) {
            logger.error("getPresent exception: " + err);
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
                                for (var i = 0; i < data.length; i++) {
                                    res.push(parseWeather(data[i]));
                                } 
                                //res=buildTestNowcast();
                                resolve(res);
                            }
                        });
                })
                .catch(function (err) {
                    logger.error("getNowcast ex: " + err);
                });
            //console.error("getNowcast resolved");
        } catch (e) {
            logger.error("getNowcast exception: " + err);
            reject(e);
        }
    });
}

function buildTestNowcast() {
    let res = [];
    for (var i = 0; i < 30; i++) {
        let now = new Date();
        now.setMinutes(now.getMinutes() + 12 * i);
        res[i] = {
            sr: now,
            ss: now,
            d: now,
            id: true,
            t: {//temp
                r: -15 + i,
                p: -15 + i,
                u: "C"
            },
            p: {//precipitation
                t: "rain",
                p: 30 / (i + 1),
                q: i
            },
            w: {//weather
                i: "asasdf"
            }
        };
    }
    //    for (var i=0;i<res.length;i++) console.warn(res[i].d);
    return res;
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
                                //resolve(buildTestForecast());
                            }
                        });
                })
                .catch(function (err) {
                    logger.error("getForecast ex: " + err);
                    reject(e);
                });
//            console.error("Forecast resolved");
        } catch (e) {
            logger.error("getForecast exception: " + err);
            reject(e);
        }
    });
}

function buildTestForecast() {
    let res = [];
    for (var i = 0; i < 12; i++) {
        let now = new Date();
        now.setHours(now.getHours() + i);
        res[i] = {
            sr: now,
            ss: now,
            d: now,
            id: true,
            t: {//temp
                r: -6 + i,
                p: -6 + i,
                u: "C"
            },
            p: {//precipitation
                t: "rain",
                p: 12 / (i + 1),
                q: i
            },
            w: {//weather
                i: "asasdf"
            }
        };
        console.error(res[i].d);

    }
    //    for (var i=0;i<res.length;i++) console.warn(res[i].d);
    return res;
}

function parseWeather(data, time) {
    let dt = new Date(time ?? data.observation_time.value);
    let sr = new Date(data.sunrise.value);
    let ss = new Date(data.sunset.value);
    let isDay = (dt > sr) && (dt < ss);
//    console.warn(dt+" "+data.precipitation_probability?.value+" ("+(data.precipitation_probability?.value?? (data.precipitation.value>0?1:0))+"%) "+data.precipitation.value);
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
            p: data.precipitation.value==0?0:data.precipitation_probability?.value ?? (data.precipitation.value>0?100:0),
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