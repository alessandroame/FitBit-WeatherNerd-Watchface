import * as settings from "./settings";
import * as logger from "./logger";
import { locale } from "user-settings";
let apiKeys = null;
let keyIndex=0;
settings.subscribe("APIKey", (keys) => { 
    apiKeys= keys.split(","); 
});

function getApiKey(){
    if (!apiKeys || apiKeys.length==0) {
        settings.set("error","api_key_missing");
    }
    if (keyIndex>=apiKeys.length) keyIndex=0;
    let res= apiKeys[keyIndex];
    //console.error(keyIndex,res);
    keyIndex++;
    return res;
}
export function update(pos) {
    console.log("Climacell -> update")
    return new Promise((resolve, reject) => {
        if (!pos || !pos.coords) {
            logger.error("climacell -> position not available");
            return;
        }
        if (!apiKeys || apiKeys.length==0) {
            logger.error("climacell -> apikey not available");
            return;
        }
        /*let startTime = new Date();
        let endTime = new Date();
        endTime.setHours(startTime.getHours() + 12);*/

        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;
        Promise.all([
            getForecast(lat, lon),
            getSunTimes(lat,lon)
        ])
            .then((values) => {
                logger.debug("climacell -> data availables");
                let res = buildData(values[0][0], values[0][1],values[1]);
                // for (let i=0;i<values[2].length;i++){
                //     let r=values[2][i];
                //     console.warn(r.d+" "+r.t.r+"  "+r.p.p+" "+r.p.q);
                // }
                resolve(res);
            }).catch(reject);
    });
}

function buildData(nowcast, forecast,suntimes) {
    let data = [];
    let now = new Date();
    /*console.log("present "+JSON.stringify(present));
    console.log("nowcast "+JSON.stringify(nowcast));
    console.log("forecast "+JSON.stringify(forecast));*/
    //return;
    for (let i = 0; i < 60; i++) {
        let current = null;
        current = findFirst(nowcast, now, 12) ?? findFirst(forecast, now, 60);
        //console.error(i,now,JSON.stringify(current))
        data.push(current);
        now.setMinutes(now.getMinutes() + 12);
    }
    let res = {
        lu: new Date(),
        sr: suntimes.sr,
        ss: suntimes.ss,
        data: data
    }
    //console.error(JSON.stringify(res));
    return res;
}

function findFirst(data, d, precision) {
    let ts = d.getTime();
    for (let i = 0; i < data.length; i++) {
        if (data[i].d.getTime() + precision * 60 * 1000 > ts) {
            return data[i];
        }
    }
    return null;
}

function getClimacellUrl(lat, lon,fields,timesteps,from, to){
    let now=from??new Date();
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    let startTime=now.toISOString();
    let url = "https://data.climacell.co/v4/timelines?" +
    "apikey=" + getApiKey() +
    "&units=metric"+
    "&location=" + lat +"," + lon +
    "&fields="+fields+
    "&startTime="+startTime+
    "&timesteps="+timesteps;
    if (to) url+="&endTime="+to.toISOString();
    //console.log(url);
    return url;
}

function getSunTimes(lat, lon) {
    return new Promise((resolve, reject) => {
        try {
            let startTime=new Date();
            let endTime=new Date();
            endTime.setHours(startTime.getHours()+24);
            let url = getClimacellUrl(lat,lon,"sunriseTime,sunsetTime","1d",startTime,endTime);
            console.log("suntimes update " + url);
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/JSON"
                }
            })
                .then(function (res) {
                    //console.log(`res code: ${res.status} ${res.statusText}  `);
                    res.json()
                        .then(response => {
                            if (response.message) {
                                logger.error(`getSunTimes error: ${JSON.stringify(response)} `);
                                reject(response);
                            } else {
                                let data=response.data.timelines[0].intervals;
                                let res = { sr:null,ss:null};
                                let now=new Date();
                                for (let i = 0; i < data.length; i++) {
                                    let sr=new Date(data[i].values.sunriseTime);
                                    let ss=new Date(data[i].values.sunsetTime);
                                    if (sr>now && !res.sr) res.sr=sr;
                                    if (ss>now && !res.ss) res.ss=ss;
                                } 
                                resolve(res);
                            }
                        });
                })
                .catch(function (err) {
                    logger.error("getSunTimes ex: " + err);
                });
            //console.error("getSunTimes resolved");
        } catch (e) {
            logger.error("getSunTimes exception: " + e);
            reject(e);
        }
    });
}

function getForecast(lat, lon) {
    return new Promise((resolve, reject) => {
        try {
            let startTime=new Date();
            let endTime=new Date();
            endTime.setHours(startTime.getHours()+12);
            let url = getClimacellUrl(lat,lon,"windSpeed,windDirection,weatherCode,precipitationIntensity,precipitationProbability,temperature","5m,1h",startTime,endTime);
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
                        .then(response => {
                            if (response.message) {
                                if (meteoData.type=="Invalid Key") settings.set("error","wrong_api_key");
                                logger.error(`getForecast error: ${JSON.stringify(response)} `);
                                reject(response);
                            } else {
                                let res = [[],[]];
                                //nowcast
                                let data=response.data.timelines[0].intervals;
                                for (let i = 0; i < data.length; i++) {
                                    res[0].push(parseWeather(data[i]));
                                }
                                //forecast
                                data=response.data.timelines[1].intervals;
                                for (let i = 0; i < data.length; i++) {
                                    //console.error(data[i].values.windDirection);
                                    res[1].push(parseWeather(data[i]));
                                }
                                resolve(res);
                            }
                        });
                })
                .catch(function (err) {
                    logger.error("getForecast ex: " + err);
                    reject(e);
                });
//            console.error("Forecast resolved");
        } catch (e) {
            logger.error("getForecast exception: " + e);
            reject(e);
        }
    });
}

function parseWeather(data, time) {
    let dt = new Date(time ?? data.startTime);
    let values=data.values;
    //console.error(dt.getHours(),values.weatherCode,values.windDirection,180-values.windDirection);
    return {
        d: dt,
        t: values.temperature,
        pp: values.precipitationIntensity==0?0:values.precipitationProbability,
        pi: values.precipitationIntensity,
        wc: values.weatherCode,
        ws: values.windSpeed*3.6,
        wd: values.windDirection-180
    };
}
 