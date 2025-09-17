import { getSelectors } from "../selectors.js";
import { apiService } from "../api/apiService.js";
import { parseMarkdown } from "../utils/mardownParser.js";
import { helpers } from "../utils/helpers.js";
import { consts } from "../config/constants.js";
import appState from "../state/appState.js";

export const NotifType = {
    SUCCESS: "success",
    FAILURE: "failure",
    INFO: "info"
}

// ------------------------
// Here comes the most
// dirty part of code :)
// ------------------------

export const UIComponents = {

    view: {
        setRoot(view) {
            const selectors = getSelectors();
            selectors.elements.root.setAttribute("view", view);
        },
        setPopup(view) {
            const selectors = getSelectors();
            selectors.elements.root.setAttribute("popup", view);
        },
        setControlPanel(view) {
            const selectors = getSelectors();
            selectors.elements.root.setAttribute("controlpanel", view);
        },
        setMusic(view) {
            const selectors = getSelectors();
            selectors.elements.root.setAttribute("music", view);
        }
    },
    




    drive: {

        enableHeaderPasteButton() {
            const selectors = getSelectors();
            selectors.elements.drive.header.pasteButton.className = "action_btn";
        },
        disableHeaderPasteButton() {
            const selectors = getSelectors();
            selectors.elements.drive.header.pasteButton.className = "action_btn disabled";
        },

        getCurrentPath() {
            const selectors = getSelectors();
            let path = "";
            let dcp = selectors.elements.drive.currentPath;
            for (let c of dcp.children){
                if (c.className == "sep"){
                    path += "/";
                }
                else if (c.className == "sub"){
                    path += c.textContent;
                }
            }
            return path;
        },

        setCurrentPath(path) {
            const selectors = getSelectors();
            let dcp = selectors.elements.drive.currentPath;
            dcp.innerHTML = "";
        
            path = path.split("/").filter(item => { return item.trim() != "" });
    
            let remainedEmpty = true;
            for (let i of path){
                let sep = document.createElement("div");
                sep.className = "sep";
                dcp.appendChild(sep);
                let sub = document.createElement("div");
                sub.className = "sub";
                sub.textContent = i;
                sub.addEventListener("click", ()=>{
                    let p = "";
                    for (let c of dcp.children){
                        if (c.className == "sub"){ p += c.textContent; }
                        else if (c.className == "sep"){ p+= "/"}
                        if (c == sub){ break; }
                    }
                    UIComponents.drive.listDirectory(p);
                });
                dcp.appendChild(sub);
                remainedEmpty = false;
            }
            if (remainedEmpty){
                let sep = document.createElement("div");
                sep.className = "sep";
                dcp.appendChild(sep);
            }
        },


        async listDirectory(path) {
            const selectors = getSelectors();
            let r = await apiService.getListDirectory(path);
            if (r == null){ return; }
    
            UIComponents.drive.setCurrentPath(path);
    
            let driveListDir = selectors.elements.drive.listDir;
            driveListDir.innerHTML = "";

            // dirs then files (alphabetically)
            r.files.sort((a, b) => {
                if (a.isDir && !b.isDir) return -1;
                if (!a.isDir && b.isDir) return 1;

                return a.name.localeCompare(b.name);
            });
    
            for (let f of r.files){
    
                let item = document.createElement("div");
                item.innerHTML = `
                <div class="icon">--icon--</div>
                <div class="name">${f.name}</div>
                <div class="size">${helpers.makeSizeHumanReadable(f.size)}</div>`;
                if (f.isDir){
                    item.className = "file dir";
                    item.innerHTML = item.innerHTML.replace("--icon--", "dir");
                    item.addEventListener("dblclick", ()=>{
                        if (path.endsWith("/")){
                            UIComponents.drive.listDirectory(`${path}${f.name}`);
                        }
                        else{
                            UIComponents.drive.listDirectory(`${path}/${f.name}`);
                        }
                    });
                    item.id = `dir-${f.name}`;
                }
                else {
                    item.className = "file";
                    let fileName = f.name.split(".");
                    let fileExt = fileName[fileName.length-1].slice(0,3);
                    item.innerHTML = item.innerHTML.replace("--icon--", fileExt);
                    item.addEventListener("dblclick",()=>{
                        let path;
                        let currentPath = UIComponents.drive.getCurrentPath();
                        if (currentPath.endsWith("/")){
                            path = `${currentPath}${fileName.join(".")}`;
                        }
                        else{
                            path = `${currentPath}/${fileName.join(".")}`;
                        }
                        
                        if (consts.audioFilesExts.includes(fileExt.toLowerCase())){
                            UIComponents.file.playAudio(path);
                        }
                        else if (consts.imageFilesExts.includes(fileExt.toLowerCase())){
                            UIComponents.file.showPopupImage(path);
                        }
                        else {
                            UIComponents.file.open(path);
                        }
    
                    });
                    item.id = `file-${f.name}`;
                }
                driveListDir.appendChild(item);
            }
        },

        back() {
            let path = UIComponents.drive.getCurrentPath().split("/");
            let prePath = "/"+path.slice(0, path.length-1).join("/");
            UIComponents.drive.listDirectory(prePath);
        },

        backAll() {
            UIComponents.drive.listDirectory("/");
        },

        async showNewDirPopup() {
            const selectors = getSelectors();
            UIComponents.view.setPopup("visible");
            let popup = selectors.elements.popup.self;
            popup.innerHTML = `
<div class="vlayout" style="margin-bottom: 10px;">
    <div class="title">Create Directory</div>
    <button class="close_btn"><svg><use href='#x_svg'></use></svg></button>
</div>
<div class="lineedit"><input type="text", placeholder="Enter Dir Name"></div>
<button class="action_btn">Create Directory</button>
            `;
            popup.getElementsByClassName("close_btn")[0].addEventListener("click", ()=>{
                UIComponents.view.setPopup("hidden");
            });
            
            let lineedit = popup.getElementsByTagName("input")[0];
            lineedit.focus()

            popup.getElementsByClassName("action_btn")[0].addEventListener("click", async ()=>{
                let name = lineedit.value;
                let cp = UIComponents.drive.getCurrentPath();
                let path = "";
                if (cp.endsWith("/")){
                    path = `${cp}${name}`;
                }
                else{
                    path = `${cp}/${name}`;
                }
                if (await apiService.sendCreateDirectory(path)){
                    UIComponents.notification.showNotification("Directory Created.", NotifType.SUCCESS, 5000);
                    UIComponents.view.setPopup("hidden");
                    UIComponents.drive.listDirectory(UIComponents.drive.getCurrentPath());
                }
                else{
                    UIComponents.notification.showNotification("There was a problem with creating directory!", NotifType.FAILURE, 5000);
                }
            });
        },


        async uploadFile(inp) {
            let file = inp.files[0];
            let fileName = file.name;

            const xhr = new XMLHttpRequest();

            const currentPath = UIComponents.drive.getCurrentPath();

            UIComponents.notification.showNotification(
                `Uploading <div class="box">${fileName}</div> file to 
                <div class="box">${currentPath}</div><br>
                <div class="box">size : ${helpers.makeSizeHumanReadable(file.size)}</div>`,
                NotifType.INFO, 5000, true, true, `notif-${fileName}`,
                ()=>{if (xhr){xhr.abort();}}
            );
            
            let form = new FormData();
            form.append("file", file);
            let path = currentPath;
            const url = `/upload?path=${path}`;

            xhr.open("POST", url, true);
            xhr.upload.addEventListener("progress", (e)=>{
                appState.isUploading = true;
                if (e.lengthComputable){
                    const percentComplete = (e.loaded / e.total) * 100;
                    UIComponents.notification.updateNotifProgressBar(`notif-${fileName}`, percentComplete.toFixed(1), `${percentComplete.toFixed(1)}%`);
                }
            });
            xhr.onload = ()=>{
                if (xhr.status == 200){
                    UIComponents.notification.showNotification(`File <div class="box">${fileName}</div> uploaded successfuly.`, NotifType.SUCCESS, 5000);
                    UIComponents.notification.clearNotif(`notif-${fileName}`);
                    if (path == UIComponents.drive.getCurrentPath()){
                        UIComponents.drive.listDirectory(
                            UIComponents.drive.getCurrentPath()
                        );
                    }
                    appState.isUploading = false;
                }
                else{
                    UIComponents.notification.showNotification(`File <div class="box">${fileName}</div> upload failed! Try again.`, NotifType.FAILURE, 5000);
                }
            }
            xhr.onerror = ()=>{
                UIComponents.notification.clearNotif(`notif-${fileName}`);
                UIComponents.notification.showNotification(`Upload error for file <div class="box">${fileName}</div>`, NotifType.FAILURE, 10000);
                appState.isUploading = false;
            }
            xhr.onabort = async ()=>{
                UIComponents.notification.clearNotif(`notif-${fileName}`);

                let delpath = `${path}/${fileName}`;
                if (delpath.startsWith("//")){
                    delpath = delpath.replace("//", "/");
                }
                await apiService.deleteFile(delpath);
            }
            xhr.send(form);
        },

        showContextMenu(top=0, left=0, path="/", isDir=false) {
            const selectors = getSelectors();
            let c = selectors.elements.drive.contextMenu;
            c.style.top = `${top}px`;
            c.style.left = `${left}px`;
            
            if (isDir) {
                c.className = "context_menu dir";
            } else {
                c.className = "context_menu";
            }

            c.setAttribute("file", path);
        },

        hideContextMenu() {
            const selectors = getSelectors();
            selectors.elements.drive.contextMenu.className = "context_menu hidden";
        },

        async showRenameFilePopup(fileName, path) {
            const selectors = getSelectors();
            let popup = selectors.elements.popup.self;

            UIComponents.view.setPopup("visible");
            popup.innerHTML = `
                <div class="vlayout" style="margin-bottom: 10px;">
                    <div class="title">Rename</div>
                    <button class="close_btn"><svg><use href='#x_svg'></use></svg></button>
                </div>
                <div class="lineedit"><input type="text" placeholder="New Name"></div>
                <button class="action_btn">Rename</button>
            `;
            popup.getElementsByClassName("close_btn")[0].addEventListener("click", ()=>{
                UIComponents.view.setPopup("hidden");
            });

            let lineedit = popup.getElementsByTagName("input")[0];
            let btn = popup.getElementsByClassName("action_btn")[0];
            lineedit.value = fileName;
            lineedit.focus();

            btn.addEventListener("click", async ()=>{
                let newFileName = lineedit.value;
                let newPath = path.split("/");
                newPath = newPath.slice(0, newPath.length-1).join("/");
                newFileName = `${newPath}/${newFileName}`;
                let r = await apiService.moveFile(path, newFileName);
                if (r[0]){
                    UIComponents.notification.showNotification("Rename was successful.", NotifType.SUCCESS, 5000);
                    UIComponents.view.setPopup("hidden");
                    UIComponents.drive.listDirectory(UIComponents.drive.getCurrentPath());
                }
                else{
                    UIComponents.drive.showNotification(r[1], NotifType.FAILURE, 5000);
                }
            });
        },

        async showDeleteFilePopup(path) {
            const selectors = getSelectors();
            UIComponents.view.setPopup("visible");
            let popup = selectors.elements.popup.self;
            popup.innerHTML = `
                <div class="vlayout" style="margin-bottom: 10px;">
                    <div class="title">Delete File</div>
                    <button class="close_btn"><svg><use href='#x_svg'></use></svg></button>
                </div>
                <div class="vlayout">
                    <button class="action_btn">Cancel</button>
                    <button class="action_btn destructive">Delete</button>
                </div>
            `;
            popup.getElementsByClassName("close_btn")[0].addEventListener("click", ()=>{
                UIComponents.view.setPopup("hidden");
            });
            let btns = popup.getElementsByClassName("action_btn");
            btns[0].addEventListener("click", ()=>{
                UIComponents.view.setPopup("hidden");
            });
            btns[1].addEventListener("click", async ()=>{
                if (await apiService.deleteFile(path)){
                    UIComponents.notification.showNotification("File Deleted.", NotifType.SUCCESS, 5000);
                    UIComponents.view.setPopup("hidden");
                    UIComponents.drive.listDirectory(UIComponents.drive.getCurrentPath());
                }
                else{
                    UIComponents.notification.showNotification("There was a problem with deleting file!", NotifType.FAILURE, 5000);
                }
            });
        }
    },





    file: {
        async open(path, download=false) {
            let a = document.createElement("a");
            a.href = `/open?path=${path}`;
            if (download){
                a.href = `/download?path=${path}`;
            }
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            await helpers.sleep(100);
            a.remove();
        },

        async showPopupImage(path) {
            const selectors = getSelectors();
            path = `/download?path=${path}`;
            UIComponents.view.setPopup("view_image");
            selectors.elements.popup.self.innerHTML = `
            <div class="vlayout" style="margin-bottom: 10px;">
                <div class="title">View Image</div>
                <button class="close_btn"><svg><use href='#x_svg'></use></svg></button>
            </div>
            <img src="${path}">
            `;
            selectors.elements.popup.self
            .getElementsByClassName("close_btn")[0]
            .addEventListener("click", ()=>{
                UIComponents.view.setPopup("hidden");
            });
        },


        async playAudio(path) {
            const selectors = getSelectors();
            let musicplayerAudio = selectors.elements.musicPlayer.audio;
            musicplayerAudio.pause();
            UIComponents.notification.showNotification(
                "Downloading audio, playing will start after download. please wait...",
                NotifType.INFO,
                10000
            );
            let name = path.split("/");
            selectors.elements.musicPlayer.name.textContent = name[name.length-1];
            selectors.elements.musicPlayer.playButton.className = "pbutton loading";
            UIComponents.view.setMusic("playing");
            
            const url = `/download?path=${path}`;

            const xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';

            xhr.onprogress = function(event) {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    selectors.elements.musicPlayer.status.textContent = `${percentComplete.toFixed(2)}%`;
                    selectors.elements.musicPlayer.progressTrack.style.width = `${percentComplete.toFixed(2)}%`;
                    selectors.elements.musicPlayer.progressTrack.className = "track downloading";
                }
            };

            xhr.onload = function() {
                if (xhr.status === 200) {
                    const audioBlob = new Blob([xhr.response], { type: xhr.getResponseHeader('Content-Type') });
                    const audioURL = URL.createObjectURL(audioBlob);

                    musicplayerAudio.src = audioURL;
                    musicplayerAudio.currentTime = 0;
                    musicplayerAudio.load();
                    musicplayerAudio.play();
                    selectors.elements.musicPlayer.playButton.className = "pbutton pause";
                    selectors.elements.musicPlayer.progressTrack.className = "track";

                } else {
                    UIComponents.notification.showNotification(
                        `Downloading audio failed: <div class="box">${xhr.status}</div>`,
                        NotifType.FAILURE,
                        10000
                    );
                }
            };

            xhr.onerror = function() {
                UIComponents.notification.showNotification("Loading audio failed", NotifType.FAILURE, 5000);
                UIComponents.view.setMusic("hidden");
            };

            selectors.elements.musicPlayer.closeButton.addEventListener("click", ()=>{
                xhr.abort();
            });

            xhr.send();
        }
    },




    musicPlayer: {

        setStatus(status) {
            const selectors = getSelectors();
            selectors.elements.musicPlayer.status.textContent = status;
        },

        setProgressTrack(percentage=0) {
            const selectors = getSelectors();
            selectors.elements.musicPlayer.progressTrack.style.width = `${percentage}%`;
        },

        setPlayButton(isPlaying=false) {
            const selectors = getSelectors();
            let s;
            if (isPlaying) { s = "pause" }
            else { s = "play"; }
            selectors.elements.musicPlayer.playButton.className = `pbutton ${s}`;
        }

    },




    documents: {
        
        async showDocumentPopup(name, isNew=false) {
            const selectors = getSelectors();
            let doc = "";
                
            if (!isNew) {
                doc = await apiService.getDocument(name);
            }
        
            if (doc == null){ return; }
        
            let htmlDoc = parseMarkdown(doc);
        
            doc = doc.replace(/\n/g, "<br>");

            let popup = selectors.elements.popup.self;
        
            UIComponents.view.setPopup("view_note");
            popup.innerHTML = `
<div class="vlayout" style="margin-bottom: 10px;">
    <div class="title">View & Edit Document</div>
    <button class="close_btn"><svg><use href='#x_svg'></use></svg></button>
</div>
<div class="segmented">
    <div class="btn active">View Mode</div>
    <div class="btn">Edit Mode</div>
</div>
<div class="documentview">${htmlDoc}</div>
<div class="lineedit" style="background-color: var(--bg-color);">
    <input type="text" placeholder="Document Name">
</div>
<div class="textedit" contenteditable="true">${doc}</div>
<button class="action_btn">Save Document</button>
<button class="action_btn">Delete Document</button>
            `;
            popup.getElementsByClassName("close_btn")[0].addEventListener("click", ()=>{
                UIComponents.view.setPopup("hidden");
            });
            let documentView = popup.getElementsByClassName("documentview")[0];
            let documentName = popup.getElementsByClassName("lineedit")[0];
            let documentNameInput = documentName.children[0];
            let textedit = popup.getElementsByClassName("textedit")[0];
            let saveBtn = popup.getElementsByClassName("action_btn")[0];
            let deleteBtn = popup.getElementsByClassName("action_btn")[1];
            let modeBTNs = popup.getElementsByClassName("segmented")[0].children;
        
            documentNameInput.value = name;
            modeBTNs[0].addEventListener("click", ()=>{
                documentView.innerHTML = parseMarkdown(textedit.innerText);
                documentName.className = "lineedit hidden";
                textedit.className = "textedit hidden";
                saveBtn.className = "action_btn hidden";
                documentView.className = "documentview";
                modeBTNs[0].className = "btn active";
                modeBTNs[1].className = "btn";
            });
            modeBTNs[1].addEventListener("click", ()=>{
                documentName.className = "lineedit";
                textedit.className = "textedit";
                saveBtn.className = "action_btn";
                documentView.className = "documentview hidden";
                modeBTNs[0].className = "btn";
                modeBTNs[1].className = "btn active";
            });
            
            if (isNew) {
                modeBTNs[1].click();
            } else {
                modeBTNs[0].click();
            }

            saveBtn.addEventListener("click", async ()=>{
                let name = documentNameInput.value;
                let content = textedit.innerText;
                let response = await apiService.putDocument(name, content);
                if (response) {
                    UIComponents.notification.showNotification("Document saved successfuly.", NotifType.SUCCESS, 2000);
                }
                else {
                    UIComponents.notification.showNotification("There was a problem with saving document.", NotifType.FAILURE, 5000);
                }
            });
            deleteBtn.addEventListener("click", async () => {
                saveBtn.click(); // to avoid name conflict or miss
                let name = documentNameInput.value;
                let response = await apiService.deleteDocument(name);
                if (response) {
                    UIComponents.notification.showNotification("Document deleted successfuly.", NotifType.SUCCESS, 2000);
                }
                else {
                    UIComponents.notification.showNotification("There was a problem with deleting document.", NotifType.FAILURE, 5000);
                }
            });
        },

        createNewDocument() {
            let rn = helpers.genRandomChars(8)
            let name = `New Document ${rn}`;
            UIComponents.documents.showDocumentPopup(name, true);
        },


        async listDocs() {
            const selectors = getSelectors();
            let docs = await apiService.getDocuments();
            if (docs == null) { return; }

            let docsListDocs = selectors.elements.docs.listDocs;
            docsListDocs.innerHTML = "";

            for (let docInfo of docs.docs){
                let doc = document.createElement("div");
                doc.className = "docitem";
                doc.innerHTML = `
                <svg><use href="#article_svg"></use></svg>
                <div class="name">${docInfo.name}</div>`;
                docsListDocs.appendChild(doc);
                doc.addEventListener("dblclick", ()=>{
                    UIComponents.documents.showDocumentPopup(docInfo.name);
                });
            }
        }

    },

    sdStatus: {
        async runGetStatus() {
            const selectors = getSelectors();
            while (true){
                let s = await apiService.getStatus();
                if (s != null){
                    selectors.elements.controlPanel.status.className = "status";
                    selectors.elements.controlPanel.status.innerHTML = `
MicroSD Card Initialized<br>
${helpers.makeSizeHumanReadable(s.sd_free)} Free Of ${helpers.makeSizeHumanReadable(s.sd_total)}`;
                }
                else{
                    selectors.elements.controlPanel.status.className = "status error";
                    selectors.elements.controlPanel.status.innerHTML= "Micro SD Card Is Not Present!<br>Please Insert It...";
                }
                await helpers.sleep(2000);
            }
        }
    },




    window: {
        structWindowFrames() {
            if (window.visualViewport.width <= 720){
                UIComponents.view.setControlPanel("close");
            }
            else{
                UIComponents.view.setControlPanel("open");
            }
        }
    },





    notification: {

        async showNotification(
            message, status, timeout=1000,
            stable=false, progress=false,
            notifID=null, actionBTNCallback=null
        ) {
            let notifPanel = document.getElementById("notifpanel");

            if (notifPanel == undefined){
                notifPanel = document.createElement("div");
                notifPanel.id = "notifpanel";
                document.body.appendChild(notifPanel);
            }
            
            let notif = document.createElement("div");
            notif.className = `notif ${status}`;
            notif.innerHTML = `<div>${message}<div>`;
            notifPanel.appendChild(notif);

            if (progress){
                let progressbar = document.createElement("div");
                progressbar.className = "progressbar";
                progressbar.innerHTML = 
                `<div class="trackholder"><div class="track"></div></div>
                <div class="status">0%</div>`;
                notif.appendChild(progressbar);
            }

            if (actionBTNCallback != null){
                let actionBTN = document.createElement("button");
                actionBTN.className = "action_btn";
                actionBTN.textContent = "Cancel Upload";
                actionBTN.addEventListener("click", ()=>{ actionBTNCallback() });
                notif.appendChild(actionBTN);
            }

            if (notifID != null){
                notif.id = notifID;
            }

            if (!stable){
                
                notif.addEventListener("click", async ()=>{
                    notif.className = `notif ${status} fade`;
                    await helpers.sleep(500);
                    notif.remove();
                });

                await helpers.sleep(timeout);
                notif.className = `notif ${status} fade`;
                await helpers.sleep(500);
                notif.remove();

            }
        },

        updateNotifProgressBar(notifID, progressPercentage=0, status) {
            let notif = document.getElementById(notifID);
            notif.getElementsByClassName("track")[0].style.width = `${progressPercentage}%`;
            notif.getElementsByClassName("status")[0].textContent = status;
        },

        async clearNotif(notifID) {
            let notif = document.getElementById(notifID);
            if (notif == null){ return; }
            notif.classList.add("fade");
            await helpers.sleep(500);
            notif.remove();
        }

    }

}
