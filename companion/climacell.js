import * as settings from "./settings";
import * as logger from "./logger";

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
  logger.warning("updating: "+reason);
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
      city=response;
      logger.debug("city "+city );
    });
  } else {
    logger.error("pos is null");
  }
}

function getCity(pos, callback) {
  if (!pos || !pos.coords) {
    logger.error("getcity pos is null");
    return;
  }else {
    //console.log("___________"+JSON.stringify(pos));
  }
  let lat = pos.coords.latitude;
  let lon = pos.coords.longitude;
  var url = "https://nominatim.openstreetmap.org/reverse?&lat=" + lat + "&lon=" + lon + "&format=json";
  fetch(url)
    .then(function (response) {
      response.json()
        .then(function (data) {
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

  var url = "https://api.climacell.co/v3/weather/forecast/hourly?" +
    "apikey=" + apiKey +
    "&unit_system=si" +//todo
    "&lat=" + currentPosition.coords.latitude +
    "&lon=" + currentPosition.coords.longitude +
    "&fields=precipitation,precipitation_probability,precipitation_type,temp,feels_like";//todo
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
            let parsedData = parseForecast(data);
            let d = new Date();
            let meteoData = {
              city: city,
              lastUpdate: d.getHours() + ":" + d.getMinutes(),
              forecasts: parsedData
            }
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
  //https://en.wikipedia.org/wiki/Rain#:~:text=The%20following%20categories%20are%20used,mm%20(0.39%20in)%20per%20hour
  for (let i = 0; i < 12; i++) {
    let d = data[i];

    res.push({
      d: d.observation_time.value,
      t: {
        r: d.temp.value,
        p: d.feels_like.value
      },
      p: {
        t: d.precipitation_type.value,
        p: d.precipitation_probability.value,
        q: d.precipitation.value
      }
    });
  }
  return res;
}

let sampleData = [
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 13.11,
      "units": "C"
    },
    "precipitation": {
      "value": 0.1289,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 35,
      "units": "%"
    },
    "feels_like": {
      "value": 13.11,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T13:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 12.44,
      "units": "C"
    },
    "precipitation": {
      "value": 0.499,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 50,
      "units": "%"
    },
    "feels_like": {
      "value": 12.44,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T14:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 11.91,
      "units": "C"
    },
    "precipitation": {
      "value": 0.8604,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 60,
      "units": "%"
    },
    "feels_like": {
      "value": 11.91,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T15:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 11.62,
      "units": "C"
    },
    "precipitation": {
      "value": 0.4316,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 70,
      "units": "%"
    },
    "feels_like": {
      "value": 11.62,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T16:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 11,
      "units": "C"
    },
    "precipitation": {
      "value": 0.7188,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 70,
      "units": "%"
    },
    "feels_like": {
      "value": 11,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T17:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 10.38,
      "units": "C"
    },
    "precipitation": {
      "value": 1.6855,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 60,
      "units": "%"
    },
    "feels_like": {
      "value": 10.38,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T18:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 10.11,
      "units": "C"
    },
    "precipitation": {
      "value": 1.2734,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 50,
      "units": "%"
    },
    "feels_like": {
      "value": 10.11,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T19:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 9.86,
      "units": "C"
    },
    "precipitation": {
      "value": 0.3174,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 40,
      "units": "%"
    },
    "feels_like": {
      "value": 9.86,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T20:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 9.57,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 35,
      "units": "%"
    },
    "feels_like": {
      "value": 9.57,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T21:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 9.45,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 30,
      "units": "%"
    },
    "feels_like": {
      "value": 9.45,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T22:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 9.31,
      "units": "C"
    },
    "precipitation": {
      "value": 0.0303,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "rain"
    },
    "precipitation_probability": {
      "value": 20,
      "units": "%"
    },
    "feels_like": {
      "value": 9.31,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-04T23:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 9.2,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 10,
      "units": "%"
    },
    "feels_like": {
      "value": 9.2,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T00:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 8.56,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 5,
      "units": "%"
    },
    "feels_like": {
      "value": 8.56,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T01:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 7.64,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 5,
      "units": "%"
    },
    "feels_like": {
      "value": 7.64,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T02:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 7.47,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 5,
      "units": "%"
    },
    "feels_like": {
      "value": 7.47,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T03:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 7.74,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 0,
      "units": "%"
    },
    "feels_like": {
      "value": 7.74,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T04:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 7.8,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 0,
      "units": "%"
    },
    "feels_like": {
      "value": 7.8,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T05:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 7.83,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 0,
      "units": "%"
    },
    "feels_like": {
      "value": 7.83,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T06:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 8.97,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 5,
      "units": "%"
    },
    "feels_like": {
      "value": 8.97,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T07:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 9.72,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 5,
      "units": "%"
    },
    "feels_like": {
      "value": 9.72,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T08:00:00.000Z"
    }
  },
  {
    "lat": 45.0139615,
    "lon": 7.3833391,
    "temp": {
      "value": 10.33,
      "units": "C"
    },
    "precipitation": {
      "value": 0,
      "units": "mm/hr"
    },
    "precipitation_type": {
      "value": "none"
    },
    "precipitation_probability": {
      "value": 5,
      "units": "%"
    },
    "feels_like": {
      "value": 10.33,
      "units": "C"
    },
    "observation_time": {
      "value": "2020-10-05T09:00:00.000Z"
    }
  }
];