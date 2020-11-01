import document from 'document'
import * as geom from './geom'

document.getElementById("sunriseHand").layer=90;
document.getElementById("sunsetHand").layer=90;
export function update(sunrise,sunset){
    try {
        console.log("sunrise",sunrise,"sunset",sunset);
        document.getElementById("sunriseHand").groupTransform.rotate.angle = geom.hoursToAngle(sunrise.getHours(),sunrise.getMinutes());
        document.getElementById("sunsetHand").groupTransform.rotate.angle = geom.hoursToAngle(sunset.getHours(), sunset.getMinutes());    
    }catch(e){
        log.error(e);
    }
}