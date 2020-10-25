function SettingsPage(props) {
  return (
    <Page>

      <Section
        title={<Text bold align="center">Meteo</Text>}
        description={<Text> Forecast api powerd by <Link source="http://climacell.co">Climacell™</Link> to obtian a free APIkey go <Link source="https://developer.climacell.co/sign-up">https://developer.climacell.co/sign-up</Link></Text>}>

        <Select
          label={`Update interval`}
          onSelection={(value) => {
            try {
              props.settingsStorage.setItem('minMeteoUpdateInteval', value.values[0].value);
            } catch (e) {
              console.error("settings store throw exception" + e);
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
            props.settingsStorage.setItem('unitSystem', JSON.stringify( value.values[0].value));
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
              props.settingsStorage.setItem('APIKey', JSON.stringify(value.name));
            } catch (e) {
              console.error("settings store throw exception" + e);
            }
          }}
        ></TextInput>
      </Section>

      <Section
        title={<Text bold align="center">Connection LOST handling</Text>}
        description={<Text>How to alert you when connection between phone and watch is lost.</Text>}>
        <Toggle
          settingsKey="snoozeDialogEnabled"
          label="Show snooze/dismiss dialog"
        />
        <Select
          title={`Snooze delay `}
          label={`Snooze delay `}
          onSelection={(value) => {
            try {
              props.settingsStorage.setItem('snoozeDelayMinutes', value.values[0].value);
            } catch (e) {
              console.error("settings store throw exception" + e);
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
            console.error("settings store throw exception" + e);
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
        title={<Text bold align="center">Colors</Text>}>
        <Text>Battery</Text>
        <ColorSelect
          settingsKey="batteryColor"
          colors={[
            { color: 'black' },
            { color: 'dimgrey' },
            { color: 'grey' },
            { color: 'darkgrey' },
            { color: 'lightgrey' },
            { color: 'white' },

            { color: 'purple' },
            { color: '#006ED6' },
            { color: 'green' },
            { color: 'orange' },
            { color: 'red' },
            { color: 'yellow' },

            { color: 'magenta' },
            { color: 'deepskyblue' },
            { color: 'lime' },
            { color: 'orangered' },
            { color: 'deeppink' },
            { color: 'gold' },

            { color: 'lavender' },
            { color: 'cyan' },
            { color: 'lawngreen' },
            { color: 'lightsalmon' },
            { color: 'lightpink' },
            { color: 'lightgoldenrodyellow' }
          ]}
        />
        <Text>Fitness data</Text>
        <ColorSelect
          settingsKey="fitDataColor"
          colors={[
            { color: 'black' },
            { color: 'dimgrey' },
            { color: 'grey' },
            { color: 'darkgrey' },
            { color: 'lightgrey' },
            { color: 'white' },

            { color: 'purple' },
            { color: '#006ED6' },
            { color: 'green' },
            { color: 'orange' },
            { color: 'red' },
            { color: 'yellow' },

            { color: 'magenta' },
            { color: 'deepskyblue' },
            { color: 'lime' },
            { color: 'orangered' },
            { color: 'deeppink' },
            { color: 'gold' },

            { color: 'lavender' },
            { color: 'cyan' },
            { color: 'lawngreen' },
            { color: 'lightsalmon' },
            { color: 'lightpink' },
            { color: 'lightgoldenrodyellow' }
          ]}
        />
        <Text>Clock background</Text>
        <ColorSelect
          settingsKey="clockBackgroundColor"
          colors={[
            { color: 'black' },
            { color: '#333333' },
            { color: 'dimgrey' },
            { color: 'grey' },
            { color: 'darkgrey' },
            { color: 'lightgrey' },

            { color: 'purple' },
            { color: '#006ED6' },
            { color: 'green' },
            { color: 'orange' },
            { color: 'red' },
            { color: 'yellow' },

            { color: 'magenta' },
            { color: 'deepskyblue' },
            { color: 'lime' },
            { color: 'orangered' },
            { color: 'deeppink' },
            { color: 'gold' },

            { color: 'lavender' },
            { color: 'cyan' },
            { color: 'lawngreen' },
            { color: 'lightsalmon' },
            { color: 'lightpink' },
            { color: 'lightgoldenrodyellow' }
          ]}
        />

        <Text bold align="center">Seconds hand</Text>
        <ColorSelect
          settingsKey="secondsHandColor"
          colors={[
            { color: 'black' },
            { color: 'dimgrey' },
            { color: 'grey' },
            { color: 'darkgrey' },
            { color: 'lightgrey' },
            { color: 'white' },

            { color: 'purple' },
            { color: '#006ED6' },
            { color: 'green' },
            { color: 'orange' },
            { color: 'red' },
            { color: 'yellow' },

            { color: 'magenta' },
            { color: 'deepskyblue' },
            { color: 'lime' },
            { color: 'orangered' },
            { color: 'deeppink' },
            { color: 'gold' },

            { color: 'lavender' },
            { color: 'cyan' },
            { color: 'lawngreen' },
            { color: 'lightsalmon' },
            { color: 'lightpink' },
            { color: 'lightgoldenrodyellow' }
          ]}
        />
        <Text bold align="center">Minutes hand</Text>
        <ColorSelect
          settingsKey="minutesHandColor"
          colors={[
            { color: 'black' },
            { color: 'dimgrey' },
            { color: 'grey' },
            { color: 'darkgrey' },
            { color: 'lightgrey' },
            { color: 'white' },

            { color: 'purple' },
            { color: '#006ED6' },
            { color: 'green' },
            { color: 'orange' },
            { color: 'red' },
            { color: 'yellow' },

            { color: 'magenta' },
            { color: 'deepskyblue' },
            { color: 'lime' },
            { color: 'orangered' },
            { color: 'deeppink' },
            { color: 'gold' },

            { color: 'lavender' },
            { color: 'cyan' },
            { color: 'lawngreen' },
            { color: 'lightsalmon' },
            { color: 'lightpink' },
            { color: 'lightgoldenrodyellow' }
          ]}
        />
        <Text bold align="center">Hours hand</Text>
        <ColorSelect
          settingsKey="hoursHandColor"
          colors={[
            { color: 'black' },
            { color: 'dimgrey' },
            { color: 'grey' },
            { color: 'darkgrey' },
            { color: 'lightgrey' },
            { color: 'white' },

            { color: 'purple' },
            { color: '#006ED6' },
            { color: 'green' },
            { color: 'orange' },
            { color: 'red' },
            { color: 'yellow' },

            { color: 'magenta' },
            { color: 'deepskyblue' },
            { color: 'lime' },
            { color: 'orangered' },
            { color: 'deeppink' },
            { color: 'gold' },

            { color: 'lavender' },
            { color: 'cyan' },
            { color: 'lawngreen' },
            { color: 'lightsalmon' },
            { color: 'lightpink' },
            { color: 'lightgoldenrodyellow' }
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(SettingsPage);