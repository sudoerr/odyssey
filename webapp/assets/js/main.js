import { UIComponents } from "./components/UIComponents.js";
import { setupEvents } from "./events.js";


document.addEventListener("DOMContentLoaded", ()=>{
    setupEvents();

    UIComponents.drive.listDirectory("/");
    UIComponents.sdStatus.runGetStatus();
    UIComponents.window.structWindowFrames();
    UIComponents.documents.listDocs();
});