import * as settings from "./settings";
import * as logger from "./logger";
import { locale } from "user-settings";

let callback = null;
let currentPosition = null;
let city = null;
let apiKey = null;

export function init(onDataAvailable) {
  console.log("climacell init")
  callback = onDataAvailable;
  settings.subscribe("APIKey", setAPIKey);
  settings.subscribe("_currentPosition", setPosition);
}

export function update(reason) {
  logger.Error("updating: " + reason);
  getForcasts();
}

function setAPIKey(key) {
  apiKey = key;
  if (!apiKey) {
    console.error("climacell null apikey");
    //todo show on device dialog
  }
  else {
    getForcasts();
  }
}

function setPosition(position) {
  logger.debug("pos changed");
  if (position) {
    currentPosition = position;
    getCity(position, (response) => {
      city = response;
      logger.debug("city " + city);
    });
  } else {
    logger.error("pos is null");
  }
}

function getCity(pos, callback) {
  if (!pos || !pos.coords) {
    logger.error("getcity pos is null");
    return;
  } else {
    //console.log("___________"+JSON.stringify(pos));
  }
  let lat = pos.coords.latitude;
  let lon = pos.coords.longitude;
  var url = "https://nominatim.openstreetmap.org/reverse?&lat=" + lat + "&lon=" + lon + "&format=json";
  fetch(url)
    .then(function (response) {
      response.json()
        .then(function (data) {
          //console.log(JSON.stringify(data));
          var a = data.address;
          var res = a["village"] || a["town"] || a["city"] || a["suburb"] || a["county"] || a["state"] || a["country"];
          callback(res);
          //logger.warning("city response: " + res);
        });
    })
    .catch(function (err) {
      logger.error("Error fetching city for " + lat + "&lon=" + lon + ": " + err);

    });
}

function getForcasts() {
  if (!currentPosition || !currentPosition.coords) {
    console.error("climacell position not available");
    return;
  }
  if (!apiKey) {
    logger.error("apikey not available");
    return;
  }
  let startTime=new Date();
  let endTime=new Date();
  endTime.setHours(startTime.getHours()+12);

  var url = "https://api.climacell.co/v3/weather/forecast/hourly?" +
    "apikey=" + apiKey +
    "&unit_system=" + settings.get("unitSystem", locale.temperature == "C" ? "si" : "us") +
    "&lat=" + currentPosition.coords.latitude +
    "&lon=" + currentPosition.coords.longitude +
    "&start_time="+startTime.toISOString()+
    "&end_time="+endTime.toISOString()+
    "&fields=sunrise,sunset,weather_code,precipitation,precipitation_probability,precipitation_type,temp,feels_like,wind_speed,wind_gust,wind_direction";
  console.log("climacell update " + url);
  // var res=parseData(sampleData);
  //if (callback) callback(res);
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
            logger.error(`api error: ${JSON.stringify(data)} `);
          } else {
            let meteoData = parseForecast(data);
            let d = new Date();
            meteoData.city = city;
            meteoData.lastUpdate = d.getHours() + ":" + d.getMinutes();
            //            console.log(JSON.stringify(meteoData));
            if (callback) callback(meteoData);
          }

        });
    })
    .catch(function (err) {
      logger.error("api req error: " + err);
    });
}

function parseForecast(data) {
  console.log("climacell parsing data");
  let res = [];
  let sunrise = null;
  let sunset = null;
  //https://en.wikipedia.org/wiki/Rain#:~:text=The%20following%20categories%20are%20used,mm%20(0.39%20in)%20per%20hour
  for (let i = 0; i < 12; i++) {
    let d = data[i];
    let sr = new Date(d.sunrise.value);
    let ss = new Date(d.sunset.value);
    let dt = new Date(d.observation_time.value);
    let isDay = (dt > sr) && (dt < ss);
    if (sr > sunrise) sunrise = sr;
    if (ss > sunset) sunset = ss;
    //console.log(JSON.stringify(d));
    res.push({
      d: d.observation_time.value,
      is: isDay,
      t: {//temp
        r: d.temp.value,
        p: d.feels_like.value,
        u: d.temp.units.replace("C", "°")
      },
      p: {//precipitation
        t: d.precipitation_type.value,
        p: d.precipitation_probability.value,
        q: d.precipitation.value
      },
      w: {//weather
        i: iconName(d.weather_code.value, isDay)
      }
    });
 
  }

  return {
    forecasts: res,
    sr: sunrise,
    ss: sunset
  };
}

function getCurrentWeather(){

}

function parseCurrentWeather(){

}
let dayNightIcons = ["clear", "mostly_clear", "partly_cloudy"];
function iconName(code, isDay) {
  let i = dayNightIcons.indexOf(code);
  let res = code;
  if (i != -1) res += (isDay ? "_day" : "_night");
  //console.log(res,isDay);
  return res;
}

/*

export function updateAll() {
  return new Promise(
    (resolve, reject) => {
      updatePosition()
        .then((pos) =>
          updateCity(pos)
            .then(
              updateCurrentWeather(pos)
                .then((data) => {
                  updateNowcast(pos)
                    .then((data) => {
                      updateForecast(pos)
                        .then((data) => {
                          resolve(data);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject)
            )
            .catch(reject)
        )
        .catch(reject);

    }
  );
}

function updatePosition() {
  return new Promise(
    (resolve, reject) => {
      geolocator.getCurrentPosition(true, resolve, reject);
    }
  );
}*/