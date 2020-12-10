
function SettingsPage(props) {
  let applySetting = function (keys, value) {
    for (let i = 0; i < keys.length; i++) {
      props.settingsStorage.setItem(keys[i], value);
    }
  };
  let settingError = function (e) {
    let now = new Date();
    let nowString = now.getHours() + ':' + now.getMinutes() + '.' + now.getSeconds();
    //    props.settingsStorage.setItem('settingLog', nowString+"->"+e);
  }
  let renderLines = function (lines) {
    let res = "";
    for (let i = 0; i < lines; i++) {
      res += (<Text>{lines[i]}</Text>);
    }
    return res;
  }
  //renderLines([111111,222222,333333333,444444444]);
  return (
    <Page>

      <Section
        title={<Text bold align="center">Colors</Text>}>
        <Select
          label={`Element`}
          onSelection={(value) => {
            try {
              props.settingsStorage.setItem('elementToUpdate', value.values[0].value);
              let v = props.settingsStorage.getItem(value.values[0].value);
              // if (v != "all") 
              props.settingsStorage.setItem('elementColor', v);
            } catch (e) {
              settingError(e);
            }
          }}
          settingsKey="_elementToUpdate"
          options={[
            { name: "Widgets data", value: "datumDayColor,fitDataColor,weatherWidgetColor" },
            { name: "Seconds hand, hours marker, widgets", value: "datumDayColor,secondsHandColor,clockDialHoursColor,fitDataColor,weatherWidgetColor" },
            { name: "All backgrounds", value: "clockBackgroundColor,datumBackgroundColor,fitWidgetBackgroundColor,weatherBackgroundColor" },
            { name: "All widgets background", value: "datumBackgroundColor,fitWidgetBackgroundColor,weatherBackgroundColor" },
            { name: "Clock background", value: "clockBackgroundColor" },
            { name: "Weather widget background", value: "weatherBackgroundColor" },
            { name: "Temperature", value: "weatherWidgetColor" },
            { name: "Fit widget background", value: "fitWidgetBackgroundColor" },
            { name: "Fit data", value: "fitDataColor" },
            { name: "All progress", value: "goalColor,batteryColor" },
            { name: "Goal progress", value: "goalColor" },
            { name: "Battery progress", value: "batteryColor" },
            { name: "Datum background", value: "datumBackgroundColor" },
            { name: "Day of week", value: "datumDOWColor" },
            { name: "Day number", value: "datumDayColor" },
            { name: "Hours marker", value: "clockDialHoursColor" },
            { name: "Minutes marker", value: "clockDialMinutesColor" },
            { name: "Seconds hand", value: "secondsHandColor" },
            { name: "Minutes hand", value: "minutesHandColor" },
            { name: "Hours hand", value: "hoursHandColor" },
          ]}
        />

        <ColorSelect
          settingsKey="elementColor"
          onSelection={(value) => {
            try {
              let elementToUpdate = props.settingsStorage.getItem("elementToUpdate");
              //props.settingsStorage.setItem("test", elementToUpdate);
              applySetting(elementToUpdate.split(","), value);
              props.settingsStorage.setItem(elementToUpdate, value);
            } catch (e) {
              settingError(e);
            }
          }}
          colors={[
            { color: 'black' },
            { color: 'dimgrey' },
            { color: 'grey' },
            { color: 'darkgrey' },
            { color: 'lightgrey' },
            { color: 'white' },


            { color: 'midnightblue' },
            { color: '#006ED6' },
            { color: 'deepskyblue' },
            { color: 'aqua' },
            { color: 'cyan' },
            { color: 'lightcyan' },


            { color: 'purple' },
            { color: 'blueviolet' },
            { color: 'deeppink' },
            { color: 'fuchsia' },
            { color: 'lightpink' },
            { color: 'lavender' },

            { color: 'green' },
            { color: 'limegreen' },
            { color: 'lime' },
            { color: 'lawngreen' },
            { color: 'springgreen' },
            { color: 'lightgoldenrodyellow' },

            { color: 'darkred' },
            { color: 'red' },
            { color: 'orangered' },
            { color: 'darkorange' },
            { color: 'orange' },
            { color: 'yellow' },

            { color: 'darksalmon' },
            { color: 'lightsalmon' },
            { color: 'darkgoldenrod' },
            { color: 'gold' },
            { color: 'dodgerblue' },
            { color: 'chartreuse' },

          ]}
        />

        <Select
          label={`Dial graphic`}
          onSelection={(value) => {
            try {
              props.settingsStorage.setItem('dialGraphic', value.values[0].value);
            } catch (e) {
              settingError(e);
            }
          }}
          settingsKey="_dialGraphic"
          options={[
            { name: "Gradient", value: "gradient" },
            { name: "Small hexagon pattern", value: "small_hex" },
            { name: "Big hexagon pattern", value: "big_hex" }
          ]}
        />

      </Section>

      <Section
        title={<Text bold align="center">Meteo</Text>}
        description={<Text> Forecast api powerd by <Link source="http://climacell.co">Climacell™</Link>. To obtian a free APIkey go <Link source="https://developer.climacell.co/sign-up">https://developer.climacell.co/sign-up</Link></Text>}>

        <Select
          label={`Update interval`}
          onSelection={(value) => {
            try {
              props.settingsStorage.setItem('minMeteoUpdateInteval', value.values[0].value);
            } catch (e) {
              settingError(e);
            }
          }}
          settingsKey="_minMeteoUpdateInteval"
          options={[
            { name: "1 minute (not suggested only for testing)", value: "1" },
            { name: "2 minutes", value: "2" },
            { name: "3 minutes", value: "3" },
            { name: "5 minutes", value: "5" },
            { name: "10 minutes", value: "10" },
            { name: "15 minutes", value: "15" },
            { name: "20 minutes", value: "20" },
            { name: "15 minutes", value: "30" },
            { name: "1 hour", value: "60" },
          ]}
        />

        <Select
          onSelection={(value) => {
            props.settingsStorage.setItem('unitSystem', value.values[0].value);
          }}
          label={`System of measurement`}
          settingsKey="_unitSystem"
          options={[
            { name: "Metric", value: "si" },
            { name: "Imperial", value: "us" },
          ]}
        />

        <TextInput
          align="right"
          title="Climacell™"
          label="API key"
          settingsKey="_APIKey"
          onChange={(value) => {
            try {
              props.settingsStorage.setItem('APIKey', value.name);
            } catch (e) {
              settingError(e);
            }
          }}
        ></TextInput>
      </Section>

      <Section
        title={<Text bold align="center">Connection LOST handling</Text>}
        description={<Text>How to alert you when connection between phone and watch is lost.</Text>}>
        <Toggle
          settingsKey="snoozeDialogEnabled"
          label="Show dialog"
        />
        <Select
          title={`Snooze delay `}
          label={`Snooze delay `}
          onSelection={(value) => {
            try {
              props.settingsStorage.setItem('snoozeDelayMinutes', value.values[0].value);
            } catch (e) {
              settingError(e);
            }
          }}
          settingsKey="_snoozeDelayMinutes"
          disabled={!(props.settings.snoozeDialogEnabled === "true")}
          options={[
            { name: "1 minute", value: "1" },
            { name: "2 minutes", value: "2" },
            { name: "3 minutes", value: "3" },
            { name: "5 minutes", value: "5" },
            { name: "10 minutes", value: "10" },
          ]}
        />

        <Toggle
          settingsKey="vibrateOnConnectionLost"
          label="Vibrate"
        />

      </Section>

      <Select
        title={`Logger`}
        label={`Log minimum level`}
        onSelection={(value) => {
          try {
            props.settingsStorage.setItem("logLevel", value.values[0].value);
          } catch (e) {
            settingError(e);
          }
        }}
        settingsKey="_logLevel"
        options={[
          { name: "Debug", value: "0" },
          { name: "Info", value: "1" },
          { name: "Warning", value: "2" },
          { name: "Error", value: "3" },
          { name: "Fatal", value: "4" },
        ]}
      />
      <Section
        title={<Text bold align="center">Last setting log</Text>}
      >
        {renderLines([111111, 222222, 333333333, 444444444])}
        {renderLines(props.settingsStorage.getItem("settingLog").split("\n"))}
      </Section>
    </Page>

  );
}

registerSettingsPage(SettingsPage);