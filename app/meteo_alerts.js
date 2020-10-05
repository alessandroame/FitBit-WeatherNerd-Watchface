import document from "document";
import * as logger from "../common/logger";

let alertWidgets=[];
export function init()
{
    logger.debug("meteo_alerts init");
    for (let i=0;i<12;i++) {
        alertWidgets[i]=document.getElementById("meteoAlert"+i);
        //logger.debug("----------"+alertWidgets[i]);
    }
}

export function update(alerts){
    logger.debug("meteo_alerts update");
//    logger.debug(JSON.stringify(alerts));
    for (let i=0;i<12;i++) {
      //  logger.debug(`alert #${i} opacity:${alerts[i].precipitation.probability} size:${alerts[i].precipitation.quantity}  `)
        let prec=alertWidgets[i].getElementById("precipitation");
        prec.style.opacity=alerts[i].precipitation.probability;
        prec.sweepAngle=5+25*alerts[i].precipitation.quantity;
        prec.startAngle=15-prec.sweepAngle/2;
        
        let ice=alertWidgets[i].getElementById("ice");
        ice.style.opacity=alerts[i].ice.probability; 
    }
}