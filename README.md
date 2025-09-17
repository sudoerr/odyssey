# Odyssey, ESP32 File Drive

Odyssey transforms the ESP32 into a lightweight file drive server with an integrated WebApp. Using a Micro SD card, it allows you to easily store, organize, and serve files through a modern and responsive user interface.  

[Watch Preview](https://github.com/sudoerr/odyssey/raw/refs/heads/main/Odyssey.mp4)

## Features

- [x] Complete HTTP API
- [x] Operates as an Access Point
- [x] File Management
  - [x] Create folders
  - [x] Upload, download, open, and serve files
  - [x] Rename, move, copy, and delete files and folders*
- [x] Modern, mobile-friendly WebApp with smooth animations
- [x] Open files directly in the WebApp
- [x] Correct MIME type handling and concurrent file serving
- [x] Background processing for long tasks
- [x] Micro SD card status reporting
- [x] Interactive notifications and status updates in the WebApp
- [x] Markdown Documents Support
  - [x] Create new document
  - [x] View Content in rich markdown format
  - [x] Edit documents directly in the WebApp
  - [x] Delete Documents



## ToDo:
- [ ] Add settings
  - [ ] UI customization
  - [ ] ESP32 network settings
  - [ ] ESP32 username/password authentication
  - [ ] Additional options
- [ ] Add copy progress tracking in both UI and API
- [ ] Clean up ESP32 Arduino code structure
- [ ] **More Features...**


## Hardware And Connections:
To run this project, you will need:
- ESP32 board (tested with ESP32-DevkitC V4)
- USB cable for ESP32
- Micro SD card reader module
- Micro SD card
- Some wires
- Small LED for status indication (Optional)
- Resistor For LED (Optional)


#### Wiring...

Normally you have 6 pins on a Micro SD card module, if your module is different just adjust it to work. Also I need to mention that my ESP32 board is `ESP32-DevkitC V4` \[[More Info](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html)\] So It has built-in 5V output pin and no need to do *scrap connection fixing stuff*.

```text
MODULE PIN: CS   -> ESP32 PIN: 5
MODULE PIN: SCK  -> ESP32 PIN: 18
MODULE PIN: MOSI -> ESP32 PIN: 23
MODULE PIN: MISO -> ESP32 PIN: 19
MODULE PIN: VCC  -> ESP32 PIN: 5V
MODULE PIN: GND  -> ESP32 PIN: GND (any of them)

LED PIN: 5V  -> ESP32 PIN: 13
LED PIN: GND -> ESP32 PIN: GND (any of them)
```


## Usage (Software Setup)

#### Upload ESP32 firrmware

You will need Arduino IDE to upload program to ESP32, and some libraries that you need to install.

##### Arduino Libraries :

- WIFI
- ESPAsyncWebServer
- SD (maybe built-in)
- SPI (maybe built-in)
- ArduinoJson
- AsyncJson
- Preferences

Then open firmware folder and `OdysseyFileServer` project sketch with Arduino IDE and upload it.

#### Copy WebApp Files To Micro SD Card

The `webapp` directory is the main WebApp contents that you should copy and paste in the root of Micro SD card. *(You just need to copy content inside `webapp` folder, not itself)*.

Now you're ready to go, just insert micro SD card into module and power on ESP32.

## Defaults

The project doesn't have settings part for now, so some of features like changing behavior of ESP32 WIFI to act as **Access Point** or **Peer** in another network.  

**Therefore :**
- Access Point SSID: `Odyssey`
- Password: `passwordIsNotPassword`
- Access Point IP : `10.1.1.1`
- Access Point Port: `80` (http)

*But you can change them in code anyway! for now down point is that it remains constant.*

---


### Why A File Drive On ESP32

The ESP32 is a low-power device with limited hardware resources, which makes it interesting to push its limits. This project explores what is possible and provides a useful, lightweight file server solution that can run on inexpensive hardware.


### Contributions
Contributions, improvements, and feedback are welcome.

