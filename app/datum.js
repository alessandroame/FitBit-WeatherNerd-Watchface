import { locale } from "user-settings";
import document from "document";

let oldDate = null;
export let widget=document.getElementById("datum");
let dayOfWeek = document.getElementById("dayOfWeek");
let dayNumber = document.getElementById("dayNumber");

export function init(){
    console.log("datum init");
    setInterval(() => {
        update();
    }, 30);
}

function update(){
    let now=new Date();
    if (!oldDate || oldDate != now.getDate()) {
        console.log("datum update");
        let dow = {
            it: 'dom_lun_mar_mer_gio_ven_sab'.split('_'),
            de: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            us: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            es: 'dom._lun._mar._mié._jue._vie._sáb.'.split('_'),
            fr: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
            jp: '日_月_火_水_木_金_土'.split('_'),
            kr: '일_월_화_수_목_금_토'.split('_'),
            nl: 'zo._ma._di._wo._do._vr._za.'.split('_'),
            sv: 'sön_mån_tis_ons_tor_fre_lör'.split('_'),
            cn: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
            tw: '週日_週一_週二_週三_週四_週五_週六'.split('_')
        };
        dayOfWeek.text = dow[locale.language.substr(3, 2)][now.getDay()].toUpperCase();
        dayNumber.text = now.getDate();
        oldDate = now.getDate();
    }
}