import * as logger from "../common/logger";
import document from "document";
import * as logger from "../common/logger";

let btnTL=document.getElementById("btnTL");
let btnTR=document.getElementById("btnTR");
let btnBL=document.getElementById("btnBL");
let btnBR=document.getElementById("btnBR");
let btnCenter=document.getElementById("btnCenter");

export function init(cbCenter,cbTL,cbTR,cbBL,cbBR){
    logger.debug("touch_area init -> "+btnCenter);
    btnCenter.onclick=cbCenter;
    btnTL.onclick=cbTL;
    btnTR.onclick=cbTR;
    btnBL.onclick=cbBL;
    btnBR.onclick=cbBR;
}