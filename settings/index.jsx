function SettingsPage(props) {
  return (
    <Page>

      <Section
        title={<Text bold align="center">Meteo api (powerd by <Link source="http://climacell.co">Climacell™</Link>)</Text>}
        description={<Text>To obtian a free <Link source="http://climacell.co">Climacell™</Link> APIkey go <Link source="https://developer.climacell.co/sign-up">https://developer.climacell.co/sign-up</Link></Text>}>
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
          label={`Snooze delay `}
          onSelection={(value) => {
            try {
              props.settingsStorage.setItem('snoozeDelayMinutes', value.values[0].value);
            } catch (e) {
              console.error("settings store throw exception" + e);
            }
            //console.log(  props.settingsStorage.getItem('snoozeDelayMinutes'));
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


      <Section
        title={<Text bold align="center">Colors</Text>}>
        <Text>Battery</Text>
        <ColorSelect
          settingsKey="batteryColor"
          colors={[
            { color: '#006ED6' },
            { color: 'black' },
            { color: 'blue' },
            { color: 'cyan' },
            { color: 'darkgrey' },
            { color: 'grey' },
            { color: 'lightgrey' },
            { color: 'green' },
            { color: 'darkgreen' },
            { color: 'indigo' },
            { color: 'lavender' },
            { color: 'lime' },
            { color: 'magenta' },
            { color: 'orange' },
            { color: 'pink' },
            { color: 'hotpink' },
            { color: 'plum' },
            { color: 'purple' },
            { color: 'red' },
            { color: 'violet' },
            { color: 'white' },
            { color: 'yellow' },
            { color: 'greenyellow' }
          ]}
        />

        <Text bold align="center">Seconds hand</Text>
        <ColorSelect
          settingsKey="secondsHandColor"
          colors={[
            { color: 'aqua' },
            { color: 'black' },
            { color: 'blue' },
            { color: 'cyan' },
            { color: 'darkgrey' },
            { color: 'grey' },
            { color: 'lightgrey' },
            { color: 'green' },
            { color: 'darkgreen' },
            { color: 'indigo' },
            { color: 'lavender' },
            { color: 'lime' },
            { color: 'magenta' },
            { color: 'orange' },
            { color: 'pink' },
            { color: 'hotpink' },
            { color: 'plum' },
            { color: 'purple' },
            { color: 'red' },
            { color: 'violet' },
            { color: 'white' },
            { color: 'yellow' },
            { color: 'greenyellow' }
          ]}
        />
        <Text bold align="center">Minutes hand</Text>
        <ColorSelect
          settingsKey="minutesHandColor"
          colors={[
            { color: 'aqua' },
            { color: 'black' },
            { color: 'blue' },
            { color: 'cyan' },
            { color: 'darkgrey' },
            { color: 'grey' },
            { color: 'lightgrey' },
            { color: 'green' },
            { color: 'darkgreen' },
            { color: 'indigo' },
            { color: 'lavender' },
            { color: 'lime' },
            { color: 'magenta' },
            { color: 'orange' },
            { color: 'pink' },
            { color: 'hotpink' },
            { color: 'plum' },
            { color: 'purple' },
            { color: 'red' },
            { color: 'violet' },
            { color: 'white' },
            { color: 'yellow' },
            { color: 'greenyellow' }
          ]}
        />
        <Text bold align="center">Hours hand</Text>
        <ColorSelect
          settingsKey="hoursHandColor"
          colors={[
            { color: 'aqua' },
            { color: 'black' },
            { color: 'blue' },
            { color: 'cyan' },
            { color: 'darkgrey' },
            { color: 'grey' },
            { color: 'lightgrey' },
            { color: 'green' },
            { color: 'darkgreen' },
            { color: 'indigo' },
            { color: 'lavender' },
            { color: 'lime' },
            { color: 'magenta' },
            { color: 'orange' },
            { color: 'pink' },
            { color: 'hotpink' },
            { color: 'plum' },
            { color: 'purple' },
            { color: 'red' },
            { color: 'violet' },
            { color: 'white' },
            { color: 'yellow' },
            { color: 'greenyellow' }
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(SettingsPage);