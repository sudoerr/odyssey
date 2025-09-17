export const helpers = {

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    vibrate(ms) {
        try{ navigator.vibrate(ms); }
        catch { console.error("No Vibrator!"); }
    },

    genRandomChars(length) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    makeSizeHumanReadable(size) {
        let sizes = ["B", "KiB", "MiB", "GiB", "TiB"];
        let i = 0;
        while (size >= 1024){
            size /= 1024;
            i++;
        }
        return `${size.toFixed(1)}${sizes[i]}`;
    },

    secondsToMMSS(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60); // Remove floating point
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(secs).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }
}