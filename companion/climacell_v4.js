import * as settings from "./settings";
import * as logger from "./logger";
import { locale } from "user-settings";
let apiKeys = null;
let keyIndex=0;
settings.subscribe("APIKey", (keys) => { 
    apiKeys= keys.split(","); 
});

function getApiKey(){
    if (!apiKeys || apiKeys.length==0 || apiKeys[0].length==0) {
        settings.set("messageToShow","missing_api_key");
        throw  new Error('missing api key') 
    }
    if (keyIndex>=apiKeys.length) keyIndex=0;
    let res= apiKeys[keyIndex];
    //console.error(keyIndex,res);
    keyIndex++;
    return res;
}
var positionMissingIntervalID=null;
export function update(pos) {
    console.log("Climacell -> update")
    if (positionMissingIntervalID!=null) clearInterval(positionMissingIntervalID);
    return new Promise((resolve, reject) => {
        if (!pos || !pos.coords) {
            positionMissingIntervalID=setInterval(()=>{
                settings.set("messageToShow","position_not_available");
                logger.error("climacell -> position not available");
                },5000);                
            return;
        }

        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;
        Promise.all([
            getForecast(lat, lon),
            getSunTimes(lat,lon)
        ])
            .then((values) => {
                logger.debug("climacell -> data availables");
                let res = buildData(values[0][0], values[0][1],values[1]);
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
        data: debugData(data)
    }
    //console.error(JSON.stringify(res));
    return res;
}

function debugData(data){
    //console.warn(JSON.stringify(data));
        let fields=["wc","ws","wd","t"];
        for (let i=0;i<data.length;i++){
            fields.forEach(field => {
                //console.log( data[i][field])
                if (data[i][field]===undefined
                    || data[i][field]==null){
                    logger.debug(i+" "+field+" not set "+JSON.stringify(data[i]));
                    data[i][field]=getFirstValue(data,field,i);
                    console.warn("setting "+field+": "+data[i][field]);
                }
            });
        }
    return data;
}

function getFirstValue(data,field,index){
    for (let i=index;i<data.length;i++)
    {
        if (data[i][field]!==undefined && data[i][field]!=null) return data[i][field];
    }
    for (let i=index;i<0;i--)
    {
        if (data[i][field]!==undefined && data[i][field]!=null) return data[i][field];
    }
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
            endTime.setHours(endTime.getHours()+25);//clicell return an error when you are the day before to put the hour one hour forward
            let url = getClimacellUrl(lat,lon,"sunriseTime,sunsetTime,temperature","1d",startTime,endTime);
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
                                settings.set("messageToShow","unknown_error");
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
            endTime.setHours(endTime.getHours()+12);
            let url = getClimacellUrl(lat,lon,"windSpeed,windGust,windDirection,weatherCode,precipitationIntensity,precipitationProbability,temperature","5m,1h",startTime,endTime);
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
                                if (response.type=="Invalid Key") settings.set("messageToShow","wrong_api_key");
                                logger.error(`getForecast error: ${JSON.stringify(response)} `);
                                settings.set("messageToShow","unknown_error");
                                reject(response);
                            } else {
                                let res = [[],[]];
                                //console.log(JSON.stringify(response.data));
                                //nowcast
                                let data=response.data.timelines[0].intervals;
                                for (let i = 0; i < data.length; i++) {
                                    //console.log(JSON.stringify(data[i]));
                                    res[0].push(parseWeather(data[i]));//,i==0||i==2||i==10||i==15));
                                }
                                //forecast
                                data=response.data.timelines[1].intervals;
                                for (let i = 0; i < data.length; i++) {
                                    //console.log(JSON.stringify(data[i]));
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

function parseWeather(data, generateError) {
    //console.error(generateError);
    let dt = new Date(data.startTime);
    let values=data.values;
    //console.error(dt.getHours(),values.weatherCode,values.windDirection,180-values.windDirection);
    if (generateError){
        return {
            d: dt,
            pp: values.precipitationIntensity==0?0:values.precipitationProbability,
            pi: values.precipitationIntensity,
            wc: values.weatherCode,
        };
    }else
    return {
        d: dt,
        t: values.temperature,
        pp: values.precipitationIntensity==0?0:values.precipitationProbability,
        pi: values.precipitationIntensity,
        wc: values.weatherCode,
        ws: values.windSpeed*3.6,
        wg: values.windGust*3.6,
        wd: values.windDirection-180
    };
}
 