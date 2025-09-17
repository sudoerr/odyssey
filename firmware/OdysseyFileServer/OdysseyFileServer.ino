/*
 * For more detail (instruction and wiring diagram), visit https://esp32io.com/tutorials/esp32-web-server-on-sd-card
 * https://randomnerdtutorials.com/esp32-web-server-microsd-card/
 * https://microcontrollerslab.com/esp32-web-server-hosting-files-microsd-card-arduino-ide/
 * https://randomnerdtutorials.com/esp32-microsd-card-arduino/
 * espressif WiFi documentation : https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html

 * https://github.com/me-no-dev/ESPAsyncWebServer/blob/master/README.ESP32Async.md
 */

#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SD.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <AsyncJson.h>
#include <Preferences.h>


#define PIN_SPI_CS 5
#define STATUS_LED 13
#define ASYNCWEBSERVER_REGEX

const char *ssid = "Odyssey";
const char *password = "passwordIsNotPassword";
bool isMicroSDPresent = false;
const char* contentDir = "/content";
const char* docsDir = "/docs";

// const char* httpUsername = "root";
// const char* httpPassword = "password";

AsyncWebServer server(80);


const String MimeTypes[143][2] = {
    {"aac", "audio/aac"}, {"abw", "application/x-abiword"}, {"arc", "application/x-freearc"}, {"avif", "image/avif"},
    {"avi", "video/x-msvideo"}, {"azw", "application/vnd.amazon.ebook"}, {"bin", "application/octet-stream"}, {"bmp", "image/bmp"},
    {"bz", "application/x-bzip"}, {"bz2", "application/x-bzip2"}, {"c", "text/x-c"}, {"cab", "application/vnd.ms-cab-compressed"},
    {"class", "application/java-vm"}, {"csv", "text/csv"}, {"doc", "application/msword"},
    {"docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}, {"eot", "application/vnd.ms-fontobject"},
    {"epub", "application/epub+zip"}, {"exe", "application/octet-stream"}, {"flac", "audio/flac"}, {"flv", "video/x-flv"},
    {"gif", "image/gif"}, {"gz", "application/gzip"}, {"h", "text/x-c"}, {"html", "text/html"}, {"htm", "text/html"},
    {"ico", "image/x-icon"}, {"ics", "text/calendar"}, {"jar", "application/java-archive"}, {"jpeg", "image/jpeg"},
    {"jpg", "image/jpeg"}, {"js", "application/javascript"}, {"json", "application/json"}, {"jsonld", "application/ld+json"},
    {"mid", "audio/midi"}, {"midi", "audio/midi"}, {"mjs", "application/javascript"}, {"mp3", "audio/mpeg"}, {"mp4", "video/mp4"},
    {"mpeg", "video/mpeg"}, {"mpkg", "application/vnd.apple.installer+xml"}, {"odp", "application/vnd.oasis.opendocument.presentation"},
    {"ods", "application/vnd.oasis.opendocument.spreadsheet"}, {"odt", "application/vnd.oasis.opendocument.text"}, {"oga", "audio/ogg"},
    {"ogv", "video/ogg"}, {"ogx", "application/ogg"}, {"opus", "audio/opus"}, {"otf", "font/otf"}, {"png", "image/png"}, {"pdf", "application/pdf"},
    {"php", "application/x-httpd-php"}, {"ppt", "application/vnd.ms-powerpoint"}, {"pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"},
    {"rar", "application/vnd.rar"}, {"rtf", "application/rtf"}, {"sh", "application/x-sh"}, {"svg", "image/svg+xml"}, {"tar", "application/x-tar"},
    {"tif", "image/tiff"}, {"tiff", "image/tiff"}, {"ts", "video/mp2t"}, {"txt", "text/plain"}, {"vsd", "application/vnd.visio"}, {"wav", "audio/wav"},
    {"weba", "audio/webm"}, {"webm", "video/webm"}, {"webp", "image/webp"}, {"woff", "font/woff"}, {"woff2", "font/woff2"}, {"xhtml", "application/xhtml+xml"},
    {"xls", "application/vnd.ms-excel"}, {"xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, {"xml", "application/xml"},
    {"xul", "application/vnd.mozilla.xul+xml"}, {"zip", "application/zip"}, {"3gp", "video/3gpp"}, {"3g2", "video/3gpp2"}, {"7z", "application/x-7z-compressed"},
    {"ai", "application/postscript"}, {"apk", "application/vnd.android.package-archive"}, {"app", "application/x-apple-diskimage"}, {"asf", "video/x-ms-asf"},
    {"aspx", "application/octet-stream"}, {"bat", "application/x-msdownload"}, {"cpl", "application/x-msdownload"}, {"crx", "application/x-chrome-extension"},
    {"css", "text/css"}, {"cvs", "text/x-cvs"}, {"dcr", "application/x-director"}, {"deb", "application/x-debian-package"}, {"dll", "application/octet-stream"},
    {"dmg", "application/x-apple-diskimage"}, {"dtd", "application/xml-dtd"}, {"ear", "application/java-archive"}, {"gdoc", "application/vnd.google-apps.document"},
    {"gslides", "application/vnd.google-apps.presentation"}, {"gsheet", "application/vnd.google-apps.spreadsheet"}, {"h264", "video/h264"}, {"h5", "application/x-hdf5"},
    {"hdf", "application/x-hdf"}, {"indd", "application/adobe-indesign"}, {"iso", "application/octet-stream"}, {"key", "application/vnd.apple.keynote"},
    {"kml", "application/vnd.google-earth.kml+xml"}, {"kmz", "application/vnd.google-earth.kmz"}, {"m4a", "audio/mp4a-latm"}, {"m4v", "video/x-m4v"},
    {"mhtml", "text/html"}, {"mobi", "application/x-mobipocket-ebook"}, {"msg", "application/vnd.ms-outlook"}, {"odg", "application/vnd.oasis.opendocument.graphics"},
    {"otg", "application/vnd.oasis.opendocument.graphics"}, {"otm", "application/vnd.oasis.opendocument.text-master"}, {"p12", "application/x-pkcs12"},
    {"p7b", "application/x-pkcs7-certificates"}, {"p7c", "application/pkcs7-mime"}, {"pem", "application/x-x509-ca-cert"}, {"pl", "application/x-perl"},
    {"pot", "application/vnd.ms-powerpoint"}, {"potx", "application/vnd.openxmlformats-officedocument.presentationml.template"}, {"prc", "application/x-palm-database"},
    {"ps", "application/postscript"}, {"pub", "application/x-mspublisher"}, {"py", "text/x-python"}, {"ra", "audio/x-realaudio"}, {"ram", "audio/x-pn-realaudio"},
    {"sav", "application/x-spss-sav"}, {"sql", "application/x-sql"}, {"svgz", "image/svg+xml"}, {"targz", "application/gzip"}, {"taz", "application/x-tar"},
    {"tex", "application/x-tex"}, {"torrent", "application/x-bittorrent"}, {"vcf", "text/vcard"}, {"vdi", "application/x-virtualbox-vdi"}, {"vmdk", "application/x-vmdk"},
    {"vsdx", "application/vnd.ms-visio.drawing"}, {"webmanifest", "application/manifest+json"}, {"wma", "audio/x-ms-wma"}, {"wmv", "video/x-ms-wmv"},
    {"xar", "application/vnd.xara"}, {"zsh", "text/x-shellscript"}
};


struct CopyTask {
    String src;
    String dest;
    bool done;
};

std::vector<CopyTask> CopyTaskQue;


// Micro SD Card Operations

void listDirectory(File root, JsonArray &output)
{
    while (1)
    {
        File entry = root.openNextFile();
        if (!entry)
            break;

        JsonObject fileInfo = output.createNestedObject();
        fileInfo["name"] = entry.name();
        fileInfo["size"] = entry.size();
        fileInfo["isDir"] = entry.isDirectory();
        entry.close();
    }
}

bool createDirectory(fs::FS &fs, const char* path)
{
    if (fs.mkdir(path))
        return true;
    else
        return false;
}

bool removeDirectory(fs::FS &fs, const char* path)
{
    File dir = fs.open(path);
    if (!dir) 
        return false;

    File file = dir.openNextFile();
    while (file)
    {
        const char* fileName = file.name();
        String filePath = String(path) + "/" + String(fileName).substring(String(fileName).lastIndexOf('/') + 1);

        if (file.isDirectory()) {
            if (!removeDirectory(fs, filePath.c_str()))
                return false;
        }
        else 
            if (!removeFile(fs, filePath.c_str()))
                return false;

        file = dir.openNextFile();
    }

    dir.close();
    

    if (!fs.rmdir(path))
        return false;

    return true;
}

bool renameDirectory(fs::FS &fs, const char* oldPath, const char* newPath) {
    if (!createDirectory(fs, newPath))
        return false;

    File dir = fs.open(oldPath);
    if (!dir)
        return false;

    File file = dir.openNextFile();
    while (file)
    {
        const char* fileName = file.name();
        String oldFilePath = String(oldPath) + "/" + String(fileName).substring(String(fileName).lastIndexOf('/') + 1);
        String newFilePath = String(newPath) + "/" + String(fileName).substring(String(fileName).lastIndexOf('/') + 1);

        if (file.isDirectory())
        {
            if (!renameDirectory(fs, oldFilePath.c_str(), newFilePath.c_str()))
                return false;
        }
        else 
        {
            if (!renameFile(fs, oldFilePath.c_str(), newFilePath.c_str()))
                return false;
        }
        

        file = dir.openNextFile();
    }

    dir.close();

    if (!fs.rmdir(oldPath))
        return false;

    return true;
}



bool removeFile(fs::FS &fs, const char* path)
{
    if (fs.remove(path))
        return true;
    else
        return false;
}

bool renameFile(fs::FS &fs, const char* src, const char* dest)
{
    if (fs.rename(src, dest))
        return true;
    else
        return false;
}

bool fileExists(fs::FS &fs, const char* path)
{
    if (fs.exists(path))
        return true;
    else
        return false;
}



uint8_t ibuffer[64];
int ibufferSpace = sizeof(ibuffer);

bool copyFile(fs::FS &fs, const char* source, const char* destination)
{
    File sourceFile = fs.open(source,  FILE_READ);
    File destFile = fs.open(destination, FILE_WRITE, true);

    if (!sourceFile)
    {
        Serial.println("Error opening source file.");
        return false;
    }
    if (!destFile)
    {
        Serial.println("Error opening dest file.");
        return false;
    }

    while (true)
    {
        int i  = sourceFile.readBytes((char*)ibuffer, ibufferSpace);
        if (i <= 0)
            break;

        destFile.write(ibuffer, i);
    }

    destFile.close();
    sourceFile.close();
    return true;
}










// Web Handler Functions



void handleListDirectory(AsyncWebServerRequest *request)
{
    String path = contentDir;
    if (request->hasParam("path"))
        path = contentDir+request->getParam("path")->value();
    
    if (path.endsWith("/"))
        path.remove(path.length()-1);

    DynamicJsonDocument doc(1024);
    JsonArray arr = doc.createNestedArray("files");
    
    File root = SD.open(path);

    if (!root)
    {
        doc["error"] = "Failed to open directory : "+path;
    }
    else
    {
        listDirectory(root, arr);
        root.close();
    }

    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
}



void handleCreateDirectory(AsyncWebServerRequest *request, JsonObject &jsonObj)
{
    if (!jsonObj.containsKey("path"))
    {
        request->send(400, "application/json", "{\"msg\":\"No path provided!\"}");
        return;
    }

    String path = contentDir+jsonObj["path"].as<String>();

    if (createDirectory(SD, path.c_str()))
        request->send(200, "application/json", "{\"msg\":\"Directory created.\"}");
    else
        request->send(200, "application/json", "{\"msg\":\"There was a problem!\"}");
}







struct UploadContext {
    File uploadFile;
    String uploadPath;
    AsyncWebServerRequest* request;
};
std::vector<UploadContext*> uploadContexts;

void handleFileUpload(AsyncWebServerRequest *request, 
                      const String& filename, size_t index, uint8_t *data, size_t len, bool final) {
    UploadContext* uploadContext = nullptr;

    for (auto& context : uploadContexts)
    {
        if (context->request == request)
        {
            uploadContext = context;
            break;
        }
    }

    if (!uploadContext)
    {
        uploadContext = new UploadContext();
        uploadContext->request = request;
        uploadContext->uploadPath = contentDir;

        if (request->hasParam("path", false)) 
            uploadContext->uploadPath += request->getParam("path", false)->value();

        uploadContext->uploadFile = SD.open(uploadContext->uploadPath + "/" + filename, FILE_WRITE);
        if (!uploadContext->uploadFile)
        {
            Serial.println("Failed to open file for writing");
            delete uploadContext;
            return;
        }

        uploadContexts.push_back(uploadContext);
    }

    uploadContext->uploadFile.write(data, len);
    Serial.printf("Uploaded %s: %u bytes\n", filename.c_str(), len);

    if (final)
    {
        uploadContext->uploadFile.close();
        Serial.printf("Upload complete: %s\n", filename.c_str());
        delete uploadContext;
        uploadContexts.erase(
            std::remove(
                uploadContexts.begin(),
                uploadContexts.end(),
                uploadContext
            ),
            uploadContexts.end()
        );
    }
}



void handleFileOpen(AsyncWebServerRequest *request)
{
    String path;
    if (!request->hasParam("path"))
    {
        request->send(400, "application/json", "{\"msg\": \"No path provided.\"}");
        return;
    }
    path = contentDir+request->getParam("path")->value();

    // find file extension
    String fileExtension;
    int lastIndexOfDot = path.lastIndexOf(".");

    if (lastIndexOfDot == -1 || lastIndexOfDot == 0)
        fileExtension = "";
    else
        fileExtension = path.substring(lastIndexOfDot+1);

    fileExtension.toLowerCase();
    String mimeType = "";

    for (int i=0; i<143; i++)
        if (MimeTypes[i][0] == fileExtension)
            mimeType = MimeTypes[i][1];

    request->send(SD, path, mimeType, false);
}


void handleFileDownload(AsyncWebServerRequest *request)
{
    String path;
    if (!request->hasParam("path"))
    {
        request->send(400, "application/json", "{\"msg\": \"No path provided.\"}");
        return;
    }
    path = contentDir+request->getParam("path")->value();

    // find file extension
    String fileExtension;
    int lastIndexOfDot = path.lastIndexOf(".");

    if (lastIndexOfDot == -1 || lastIndexOfDot == 0)
        fileExtension = "";
    else
        fileExtension = path.substring(lastIndexOfDot+1);

    // find mime-type
    fileExtension.toLowerCase();
    String mimeType = "";

    for (int i=0; i<143; i++)
        if (MimeTypes[i][0] == fileExtension)
            mimeType = MimeTypes[i][1];

    request->send(SD, path, mimeType, true);
}




void handleRename(AsyncWebServerRequest *request, JsonObject &jsonObj)
{
    if (!jsonObj.containsKey("src") || !jsonObj.containsKey("dest"))
    {
        request->send(400, "application/json", "{\"msg\":\"src or dest not found!\"}");
        return;
    }

    String src = contentDir+jsonObj["src"].as<String>();
    String dest = contentDir+jsonObj["dest"].as<String>();


    if (!fileExists(SD, src.c_str()))
    {
        request->send(400, "application/json", "{\"msg\": \"Source path doesn't exists!\"}");
        return;
    }
    if (fileExists(SD, dest.c_str()))
    {
        request->send(400, "application/json", "{\"msg\": \"Destination already exists!\"}");
        return;
    }

    File sFile = SD.open(src);
    if (sFile.isDirectory())
    {
        sFile.close();
        if (renameDirectory(SD, src.c_str(), dest.c_str()))
            request->send(200, "application/json", "{\"msg\": \"Directory Moved\"}");
        else
            request->send(500, "application/json", "{\"msg\": \"There was a problem with moving directory.\"}");
    }
    else
    {
        sFile.close();
        if(renameFile(SD, src.c_str(), dest.c_str()))
            request->send(200, "application/json", "{\"msg\": \"File Moved\"}");
        else
            request->send(500, "application/json", "{\"msg\": \"There was a problem with moving file.\"}");
    }
}





void handleCopyFile(AsyncWebServerRequest *request, JsonObject &jsonObj)
{
    if (!jsonObj.containsKey("src") || !jsonObj.containsKey("dest"))
    {
        request->send(400, "application/json", "{\"msg\":\"src or dest not found!\"}");
        return;
    }

    String src = contentDir+jsonObj["src"].as<String>();
    String dest = contentDir+jsonObj["dest"].as<String>();

    CopyTaskQue.push_back({src, dest, false});
    request->send(200, "application/json", "{\"msg\": \"File Copied\"}");
}

void handleRemove(AsyncWebServerRequest *request, JsonObject &jsonObj)
{
    if (!jsonObj.containsKey("path"))
    {
        request->send(400, "application/json", "{\"msg\":\"No path provided!\"}");
        return;
    }

    String path = contentDir+jsonObj["path"].as<String>();
    File sFile = SD.open(path);

    if (sFile.isDirectory())
    {
        sFile.close();
        if (removeDirectory(SD, path.c_str()))
            request->send(200, "application/json", "{\"msg\": \"Directory Deleted.\"}");
        else
            request->send(500, "application/json", "{\"msg\": \"There was a problem with deleting directory.\"}");
    }
    else
    {
        sFile.close();
        if (removeFile(SD, path.c_str()))
            request->send(200, "application/json", "{\"msg\": \"File Deleted.\"}");
        else
            request->send(500, "application/json", "{\"msg\": \"There was a problem with deleting file.\"}");
    }

}


void handleGetDocs(AsyncWebServerRequest *request)
{
    String path = docsDir;
    DynamicJsonDocument doc(1024);
    JsonArray arr = doc.createNestedArray("docs");
    
    File root = SD.open(path);

    if (!root)
    {
        doc["error"] = "Failed to open directory : "+path;
    }
    else
    {
        listDirectory(root, arr);
        root.close();
    }

    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
}

void handleGetDocument(AsyncWebServerRequest *request)
{
    if (!request->hasParam("name"))
    {
        request->send(400, "application/json", "{\"msg\":\"No name provided!\"}");
        return;
    }
    String name = request->getParam("name")->value();
    name = String(docsDir)+"/"+name;

    Serial.println(name);
    
    File doc = SD.open(name.c_str(), FILE_READ);
    if (!doc)
    {
        request->send(404, "text/plain", "Document not found.");
        return;
    }
    request->send(doc, name, "text/plain");
}

void handlePutDocument(AsyncWebServerRequest *request, JsonObject &jsonObj)
{
    if (!jsonObj.containsKey("name"))
    {
        request->send(400, "application/json", "{\"msg\":\"No name provided!\"}");
        return;
    }
    if (!jsonObj.containsKey("content"))
    {
        request->send(400, "application/json", "{\"msg\":\"No content provided!\"}");
        return;
    }

    String name = String(docsDir)+"/"+jsonObj["name"].as<String>();
    String content = jsonObj["content"].as<String>();
    File doc = SD.open(name.c_str(), FILE_WRITE);

    Serial.println(name);


    if (doc)
    {
        doc.println(content);
        doc.close();
        Serial.println("File Written");
        request->send(200, "application/json", "{\"msg\":\"Document saved.\"}");
    }
    else
    {
        request->send(500, "application/json", "{\"msg\":\"Internal Server Error.\"}");
    }
}


void handleDeleteDocument(AsyncWebServerRequest *request, JsonObject &jsonObj)
{
    if (!jsonObj.containsKey("name"))
    {
        request->send(400, "application/json", "{\"msg\":\"No name provided!\"}");
        return;
    }

    String name = String(docsDir)+"/"+jsonObj["name"].as<String>();
    SD.remove(name.c_str());
    request->send(200, "application/json", "{\"msg\":\"Document deleted.\"}");
}


void handleRoot(AsyncWebServerRequest *request)
{
    request->send(SD, "/index.html", "text/html");
}

void handleFavicon(AsyncWebServerRequest *request)
{
    request->send(SD, "/assets/icon.svg", "image/svg+xml");
}

void handleGetStatus(AsyncWebServerRequest *request)
{
    if (isMicroSDPresent)
    {
        String res;
        res += "{\"sd_total\":";
        res += String(SD.totalBytes());
        res += ",\"sd_free\":";
        res += String(SD.totalBytes() - SD.usedBytes());
        res += ",\"sd_used\":";
        res += String(SD.usedBytes());
        res += "}";
        request->send(200, "application/json", res);
    }
    else
    {
        request->send(503, "application/json", "{\"msg\": \"Micro SD card is not present\"}");
    }
}


void setup()
{
    Serial.begin(9600);
    pinMode(STATUS_LED, OUTPUT);
    digitalWrite(STATUS_LED, LOW);

    WiFi.mode(WIFI_AP);
    IPAddress IP = {10,1,1,1};
    IPAddress NetMask = {255,255,255,0};
    WiFi.softAPConfig(IP, IP, NetMask);

    // bool softAP(
    //    const char* ssid,
    //    const char* passphrase = NULL,
    //    int channel = 1,
    //    int ssid_hidden = 0,
    //    int max_connection = 4,
    //    bool ftm_responder = false
    // );

    WiFi.softAP(ssid, password, 1, 0, 2, false);

    server.on("/", HTTP_GET, handleRoot);
    server.on("/ls", HTTP_GET, handleListDirectory);
    server.on("/open", HTTP_GET, handleFileOpen);
    server.on("/download", HTTP_GET, handleFileDownload);
    server.on("/get_status", HTTP_GET, handleGetStatus);
    server.on("/favicon.ico", HTTP_GET, handleFavicon);
    server.on("/docs", HTTP_GET, handleGetDocs);
    server.on("/get_doc", HTTP_GET, handleGetDocument);
    server.serveStatic("/assets", SD, "/assets");
    
    server.on("/upload", HTTP_POST, [](AsyncWebServerRequest *request) {
        request->send(200, "text/plain", "File uploaded successfully");
    }, handleFileUpload);

    server.addHandler(new AsyncCallbackJsonWebHandler("/mkdir", [](AsyncWebServerRequest *request, JsonVariant& json){
        JsonObject jsonObj = json.as<JsonObject>();
        handleCreateDirectory(request, jsonObj);
    }));

    server.addHandler(new AsyncCallbackJsonWebHandler("/rm", [](AsyncWebServerRequest* request, JsonVariant& json){
        JsonObject jsonObj = json.as<JsonObject>();
        handleRemove(request, jsonObj);
    }));

    server.addHandler(new AsyncCallbackJsonWebHandler("/mv", [](AsyncWebServerRequest* request, JsonVariant& json){
        JsonObject jsonObj = json.as<JsonObject>();
        handleRename(request, jsonObj);
    }));

    server.addHandler(new AsyncCallbackJsonWebHandler("/cp", [](AsyncWebServerRequest* request, JsonVariant& json){
        JsonObject jsonObj = json.as<JsonObject>();
        handleCopyFile(request, jsonObj);
    }));

    server.addHandler(new AsyncCallbackJsonWebHandler("/put_doc", [](AsyncWebServerRequest* request, JsonVariant& json){
        JsonObject jsonObj = json.as<JsonObject>();
        handlePutDocument(request, jsonObj);
    }));

    server.addHandler(new AsyncCallbackJsonWebHandler("/del_doc", [](AsyncWebServerRequest* request, JsonVariant& json){
        JsonObject jsonObj = json.as<JsonObject>();
        handleDeleteDocument(request, jsonObj);
    }));


    server.begin();

    // ------------------------------------------------------------
    // frequency is 4000000 (4MHz), if you encounter read/write
    // errors or corrupted files reduce it to something lower
    // like 1000000 (1MHz), but it'll reduce read/write speed
    // but usually 1-4 MHz is safe...
    // ------------------------------------------------------------
    // max_files=15 becuase of concurrent read errors, don't abuse it!!!
    // ------------------------------------------------------------
    isMicroSDPresent = SD.begin(PIN_SPI_CS, SPI, 4000000, "/sd", 15);
    if (isMicroSDPresent)
    {
        if (!SD.exists(contentDir)) SD.mkdir(contentDir);
        if (!SD.exists(docsDir)) SD.mkdir(docsDir);
    }
}


void processNextCopyTask()
{
    if (CopyTaskQue.empty())
        return;

    CopyTask& currentTask = CopyTaskQue.front();
    Serial.println("Processing task: Copying from " + currentTask.src + " to " + currentTask.dest);
    currentTask.done = copyFile(SD, currentTask.src.c_str(), currentTask.dest.c_str());
    
    if (currentTask.done)
        Serial.println("Completed: Copying from " + currentTask.src + " to " + currentTask.dest);
    else
        Serial.println("Failed: Copying from " + currentTask.src + " to " + currentTask.dest);

    CopyTaskQue.erase(CopyTaskQue.begin());
}



void loop()
{
    if (!SD.exists(contentDir))
    {
        isMicroSDPresent = false;
        Serial.println("SD Card not present or not inserted correctly!");
        digitalWrite(STATUS_LED, LOW);
    }
    else
    {
        isMicroSDPresent = true;
        digitalWrite(STATUS_LED, HIGH);
    }
    
    processNextCopyTask();

    // ToDo: to copy a file. create status structure. {src, dest, status} then put it inside an array or vector or list and process copy file in loop()
    // ToDo: fix all double // problems in copy, rename and remove!
}




