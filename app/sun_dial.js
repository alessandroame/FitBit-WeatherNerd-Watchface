import document from 'document'
import * as geom from '../common/geom'
import * as settings from "./settings"

//this generate errors with mask 
//document.getElementById("sunriseHand").layer=90;
//document.getElementById("sunsetHand").layer=90;

let oldSs,oldSr;
export function update(sunrise,sunset){
    try {
        if(oldSr!=sunrise){
            document.getElementById("sunriseHand").groupTransform.rotate.angle = geom.hoursToAngle(sunrise.getHours(),sunrise.getMinutes());
            oldSr=sunrise;
        }
        if(oldSs!=sunset){
            document.getElementById("sunsetHand").groupTransform.rotate.angle = geom.hoursToAngle(sunset.getHours(), sunset.getMinutes());    
            oldSs=sunset;
        }
    }catch(e){
        console.error(e);
    }
}


settings.subscribe("_aodMode",(value)=>{
    let display=value?"none":"inline";
    document.getElementById("sunriseHand").style.display=display;
    document.getElementById("sunsetHand").style.display=display;
});