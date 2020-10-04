import * as clock from "./clock"
import * as connectionWidget from "./connection_widget"
import * as settings from "./settings"
import * as battery from "./battery"

clock.init();
connectionWidget.init();
settings.init();
battery.init();
console.log("App started");