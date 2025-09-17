
import { getSelectors } from "./selectors.js";
import { UIComponents, NotifType } from "./components/UIComponents.js";
import { helpers } from "./utils/helpers.js";
import { apiService } from "./api/apiService.js";
import appState from "./state/appState.js";


export const setupEvents = ()=>{

const selectors = getSelectors();

// MUSIC PLAYER --------------------------

selectors.elements.musicPlayer.audio.addEventListener("timeupdate", ()=> {
    let a = selectors.elements.musicPlayer.audio;
    let value = (a.currentTime / a.duration) * 100;
    UIComponents.musicPlayer.setProgressTrack(value);
    UIComponents.musicPlayer.setStatus(helpers.secondsToMMSS(a.currentTime));
});

selectors.elements.musicPlayer.audio.addEventListener("ended", ()=>{
    selectors.elements.musicPlayer.audio.currentTime = 0;
    UIComponents.musicPlayer.setProgressTrack(0);
    UIComponents.musicPlayer.setPlayButton(false);
});

selectors.elements.musicPlayer.closeButton.addEventListener("click", ()=>{
    selectors.elements.musicPlayer.audio.pause();
    UIComponents.view.setMusic("hidden");
});

selectors.elements.musicPlayer.playButton.addEventListener("click", ()=>{
    let p = selectors.elements.musicPlayer.playButton;
    if (p.classList.contains("play")) {
        UIComponents.musicPlayer.setPlayButton(true);
        selectors.elements.musicPlayer.audio.play();
    }
    else if (p.classList.contains("pause")) {
        UIComponents.musicPlayer.setPlayButton(false);
        selectors.elements.musicPlayer.audio.pause();
    }
});



// CONTROL PANEL -------------------------

selectors.elements.controlPanel.items.addEventListener("click", (e)=>{
    if (e.target.className == "items"){ return; }
    if (e.target.className == "item"){
        if (e.target.getAttribute("setview") == "docs"){
            UIComponents.documents.listDocs();
        }
        UIComponents.view.setRoot(e.target.getAttribute("setview"));
        UIComponents.window.structWindowFrames();
        helpers.vibrate(50);
    }
    if (e.target.parentElement.className == "item"){
        if (e.target.getAttribute("setview") == "docs"){
            UIComponents.documents.listDocs();
        }
        UIComponents.view.setRoot(e.target.getAttribute("setview"));
        UIComponents.window.structWindowFrames();
        helpers.vibrate(50);
    }
});


selectors.elements.controlPanel.openCloseButton.addEventListener("click", ()=>{
    if (selectors.elements.root.getAttribute("controlpanel") == "open") {
        UIComponents.view.setControlPanel("close");
    } else {
        UIComponents.view.setControlPanel("open");
    }
});


window.addEventListener("resize", ()=>{
    UIComponents.window.structWindowFrames();
});


// POPUP ---------------------------------

selectors.elements.popup.cover.addEventListener("click", (e)=>{
    if (e.target == selectors.elements.popup.cover) {
        UIComponents.view.setPopup("hidden");
    }
});




// DRIVE ---------------------------------

selectors.elements.drive.currentPathBack.addEventListener("mousedown", (e)=>{
    if (e.button === 1) {
        UIComponents.drive.listDirectory("/");
        e.preventDefault();
    }
});

selectors.elements.drive.currentPathBack.addEventListener("click", ()=>{
    let path = UIComponents.drive.getCurrentPath().split("/");
    let prePath = "/"+path.slice(0, path.length-1).join("/");
    UIComponents.drive.listDirectory(prePath);
});

selectors.elements.drive.header.newFolderButton.addEventListener("click", ()=>{
    UIComponents.drive.showNewDirPopup();
});

selectors.elements.drive.header.uploadFileButton.addEventListener("click", ()=>{
    let inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "*/*";
    inp.className = "hidden";
    inp.addEventListener("input", ()=>{
        UIComponents.drive.uploadFile(inp);
    });
    inp.click();
});

selectors.elements.drive.listDir.addEventListener("contextmenu", (e)=>{
    e.preventDefault();
    
    let currentPath = UIComponents.drive.getCurrentPath();
    if (currentPath.endsWith("/")){
        currentPath = currentPath.slice(0, currentPath.length-1);
    }

    if (e.target.className == "file"){
        let isDir = false;
        let path = `${currentPath}/${e.target.id.replace("file-", "")}`;
        UIComponents.drive.showContextMenu(e.clientY, e.clientX, path, isDir);
    }
    else if (e.target.className == "file dir"){
        let isDir = true;
        let path = `${currentPath}/${e.target.id.replace("dir-", "")}`;
        UIComponents.drive.showContextMenu(e.clientY, e.clientX, path, isDir);
    }

});

document.addEventListener("click", ()=>{
    UIComponents.drive.hideContextMenu();
});


selectors.elements.drive.header.pasteButton.addEventListener("click", async ()=>{
    if (selectors.elements.drive.header.pasteButton.classList.contains("disabled")) {
        return;
    }

    if (appState.CPMVPath.startsWith("copy-")) {
        let path = appState.CPMVPath.replace("copy-", "");
        let splittedPath = path.split("/");
        let currentPath = UIComponents.drive.getCurrentPath();
        if (currentPath == "/"){
            currentPath = `/${splittedPath[splittedPath.length-1]}`;
        }
        else {
            currentPath = `${currentPath}/${splittedPath[splittedPath.length-1]}`;
        }
        let r = await apiService.copyFile(path, currentPath);
        if (r[0]){
            UIComponents.notification.showNotification(`File copy was successful to <div class="box">${currentPath}</div>`, NotifType.SUCCESS, 5000);
            UIComponents.drive.disableHeaderPasteButton();
            appState.CPMVPath = null;
            UIComponents.drive.listDirectory(UIComponents.drive.getCurrentPath());
        }
        else{
            UIComponents.notification/showNotification(`${r[1]}`, NotifType.FAILURE, 10000);
        }
    }

    else if (appState.CPMVPath.startsWith("move-")) {
        let path = appState.CPMVPath.replace("move-", "");
        let splittedPath = path.split("/");
        let currentPath = UIComponents.drive.getCurrentPath();
        if (currentPath == "/"){
            currentPath = `/${splittedPath[splittedPath.length-1]}`;
        }
        else {
            currentPath = `${currentPath}/${splittedPath[splittedPath.length-1]}`;
        }
        let r = await apiService.moveFile(path, currentPath);
        if (r[0]){
            UIComponents.notification.showNotification(`File move was successful to <div class="box">${currentPath}</div>`, NotifType.SUCCESS, 5000);
            UIComponents.drive.disableHeaderPasteButton();
            appState.CPMVPath = null;
            UIComponents.drive.listDirectory(UIComponents.drive.getCurrentPath());
        }
        else{
            UIComponents.notification/showNotification(`${r[1]}`, NotifType.FAILURE, 10000);
        }
    }
});


selectors.elements.drive.contextMenu.addEventListener("click", (e)=>{
    let dcm = selectors.elements.drive.contextMenu;
    let items = dcm.getElementsByClassName("item");
    let filePath = dcm.getAttribute("file");

    if (e.target == items[0]) {
        UIComponents.file.open(filePath);
    }

    else if (e.target == items[1]) {
        UIComponents.file.open(filePath, true);
    }

    else if (e.target == items[2]) {
        let fileName = filePath.split("/");
        fileName = fileName[fileName.length-1];
        UIComponents.drive.showRenameFilePopup(fileName, filePath);
    }

    else if (e.target == items[3]) {
        appState.CPMVPath = `copy-${filePath}`;
        UIComponents.drive.enableHeaderPasteButton();
        UIComponents.notification.showNotification("File copied to clipboard.", NotifType.INFO, 4000);
    }

    else if (e.target == items[4]) {
        appState.CPMVPath = `move-${filePath}`;
        UIComponents.drive.enableHeaderPasteButton();
        UIComponents.notification.showNotification("File moved to clipboard.", NotifType.INFO, 4000);
    }

    else if (e.target == items[5]) {
        UIComponents.drive.showDeleteFilePopup(filePath);
    }
});



// DOCS ----------------------------------

selectors.elements.docs.header.newDocButton.addEventListener("click", ()=>{
    let rn = helpers.genRandomChars(8);
    UIComponents.documents.showDocumentPopup(`New Document ${rn}`, true);
});




// CODE TAGS -----------------------------

// Array.from(document.getElementsByTagName("code")).forEach((c)=>{
//     c.addEventListener("click", ()=>{
//         navigator.clipboard.writeText(c.textContent);
//         UIComponents.notification.showNotification(
//             `<div class="box">${c.textContent}</div>Copied To Clipboard`,
//             NotifType.SUCCESS,
//             3000
//         );
//     });
// });

}    

