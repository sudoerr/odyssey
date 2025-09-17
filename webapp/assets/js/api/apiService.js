export const apiService = {

    async sendCreateDirectory(path) {
        let r = await fetch("/mkdir", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({path: path})
        });
        if (r.ok){
            return true;
        }
        else{
            return false;
        }
    },

    async getListDirectory(path) {
        let r = await fetch(`/ls?path=${path}`, {method: "GET"});
        if (r.ok){
            return await r.json();
        }
        else{
            return null;
        }
    },

    async getStatus() {
        let r = await fetch("/get_status", {method: "GET"});
        if (r.ok){
            return await r.json();
        }
        return null;
    },

    async moveFile(src, dst) {
        let r = await fetch(`/mv?`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                src: src,
                dest: dst
            })
        });
        if (r.ok){
            return [true, ""];
        }
        let msg = await r.json();
        return [false, msg.msg];
    },

    async copyFile(src, dst) {
        let r = await fetch(`/cp`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                src: src,
                dest: dst
            })
        });
        if (r.ok){
            return [true, ""];
        }
        let data = await r.json();
        return [false, data.msg];
    },

    async deleteFile(path) {
        let r = await fetch(`/rm`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                path: path
            })
        });
        if (r.ok){
            return true;
        }
        return false;
    },

    async getDocuments() {
        let r = await fetch(`/docs`, {method: "GET"});
        if (r.ok){
            return await r.json();
        }
        else{
            return null;
        }
    },

    async getDocument(name) {
        let r = await fetch(`/get_doc?name=${name}`, {method: "GET"});
        if (r.ok){
            return await r.text();
        }
        else{
            return null;
        }
    },

    async putDocument(name, content) {
        let r = await fetch(`/put_doc`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: name,
                content: content
            })
        });
        if (r.ok){
            return true;
        }
        return false;
    },

    async deleteDocument(name) {
        let r = await fetch(`/del_doc`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: name,
            })
        });
        if (r.ok){
            return true;
        }
        return false;
    }

}
