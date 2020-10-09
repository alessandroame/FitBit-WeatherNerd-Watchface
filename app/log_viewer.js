import * as logger from "./logger"
import document from "document";

export function showLogger(){
    document.location.assign("logger.view").then(() => {
        let scrollPosition=0;
        let canUp=true;
        let canDown=true;

        let fetchLog=()=>{
            scrollPosition=Math.min(Math.max(0,scrollPosition),10);
            let res=logger.getCache(scrollPosition);
            canDown=res.canDown;
            canUp=res.canUp;
            document.getElementById("text").text=res.content;
        };
        fetchLog();
        document.getElementById("close").addEventListener("click", ()=>{
            document.history.back();
        });

        document.getElementById("reset").addEventListener("click", (evt)=>{ 
            logger.reset();
            fetchLog();
        });
        document.getElementById("scrollDown").addEventListener("click", ()=>{
            if (canDown) scrollPosition++;
            fetchLog();
        });    
        document.getElementById("scrollUp").addEventListener("click", ()=>{
            if (canUp) scrollPosition--;
            fetchLog();
        });
    });
}

