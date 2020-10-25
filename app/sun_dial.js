import document from 'document'
import * as geom from './geom'

export function update(sunrise,sunset){
    try {
    document.getElementById("sunriseHand").groupTransform.rotate.angle = geom.hoursToAngle(sunrise.getHours(),sunrise.getMinutes());
    document.getElementById("sunsetHand").groupTransform.rotate.angle = geom.hoursToAngle(sunset.getHours(), sunset.getMinutes());    
    }catch(e){
        log.error(e);
    }
}