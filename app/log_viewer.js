
import * as logger from "../common/logger";
import document from "document";


export function showLogger(){
    document.location.assign("logger.view").then(() => {
        logger.debug("logger.view loaded");
        let txt=document.getElementById("text");
        txt.addEventListener("click", (evt) => {
            document.history.back();
        });
        txt.text=logger.getCache();
    });
}
