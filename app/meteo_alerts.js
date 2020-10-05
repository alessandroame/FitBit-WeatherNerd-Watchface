import document from "document";

let alertWidgets=[];
export function init()
{
    console.log("meteo_alerts init");
    for (let i=0;i<12;i++) {
        alertWidgets[i]=document.getElementById("meteoAlert"+i);
        //console.log("----------"+alertWidgets[i]);
    }
}

export function update(alerts){
    console.log("meteo_alerts update");
//    console.log(JSON.stringify(alerts));
    for (let i=0;i<12;i++) {
      //  console.log(`alert #${i} opacity:${alerts[i].precipitation.probability} size:${alerts[i].precipitation.quantity}  `)
        let prec=alertWidgets[i].getElementById("precipitation");
        prec.style.opacity=alerts[i].precipitation.probability;
        prec.sweepAngle=5+25*alerts[i].precipitation.quantity;
        prec.startAngle=15-prec.sweepAngle/2;
        
        let ice=alertWidgets[i].getElementById("ice");
        ice.style.opacity=alerts[i].ice.probability; 
    }
}