export const getSelectors = () => ({
    elements: {
        root: document.body.parentElement,

        popup: {
            self: document.getElementById("popup"),
            cover: document.getElementById("popup_cover")
        },

        controlPanel: {
            items: document.getElementById("control_panel_items"),
            status: document.getElementById("control_panel_status"),
            openCloseButton: document.getElementById("control_panel_oc_btn")
        },

        drive: {
            header: {
                newFolderButton: document.getElementById("drive_header_new_folder_btn"),
                uploadFileButton: document.getElementById("drive_header_upload_file_btn"),
                pasteButton: document.getElementById("drive_header_paste_btn")
            },

            listDir: document.getElementById("drive_list_dir"),
            currentPath: document.getElementById("drive_current_path"),
            currentPathBack: document.getElementById("drive_current_path_back"),

            contextMenu: document.getElementById("drive_context_menu")
        },

        docs: {
            listDocs: document.getElementById("docs_list"),

            header: {
                newDocButton: document.getElementById("drive_header_new_doc_btn"),
            }
        },

        musicPlayer: {
            self: document.getElementById("musicplayer"),
            audio: document.getElementById("musicplayer_audio"),
            playButton: document.getElementById("musicplayer_pbutton"),
            name: document.getElementById("musicplayer_name"),
            progressTrack: document.getElementById("musicplayer_progress_track"),
            closeButton: document.getElementById("musicplayer_close_btn"),
            status: document.getElementById("musicplayer_status"),
        }
    }
});
