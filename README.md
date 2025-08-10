# stream-o-vision


## CircuitPython Development/Tooling

The best way I've found to develop in VSCode is to use the CircuitPython v2 extension. You can connect to a serial port with the 'CircuitPython: Open Serial Monitor' command and selecting the appropriate port. This will open a terminal window in VSCode that will display the serial output from the microcontroller, and automatically refresh on save.

If you'd developing on Linux and you'd like to work in a local version controlled directory, you can use the `./sync.sh` script to sync the contents of `./microcontroller` with the mounted CircuitPython drive.
In order to use this script you will need `inotify-tools` installed. You can install it with the following command:
```bash
sudo apt-get install inotify-tools
```

Usage (assuming you've run `chmod +x sync.sh`):
```bash
./sync.sh [optional path to CIRCUITPY]
```
The script will take an optional argument to specify the path to the mounted CircuitPython drive. If no argument is provided, the script will default to `/media/$USER/CIRCUITPY`.

With this script running, you can develop directly from the mounted CircuitPython drive, and the script will automatically sync the changes to the local directory, where they can be version controlled.

## Docs
- Adafruit Feather RP2040: https://learn.adafruit.com/adafruit-feather-rp2040-pico
- Adafruit Featherwing OLED: https://learn.adafruit.com/adafruit-128x64-oled-featherwing/circuitpython
- Analog Video Vertical Sync: https://youtu.be/NY2rIjkH1Xw?si=GuOFTU6XGeTw2jW9
- NTSC 525 Scanlines: https://en.wikipedia.org/wiki/NTSC
- Skeuomorphic Design: https://en.wikipedia.org/wiki/Skeuomorph
- https://codepen.io/meduzen/pen/zxbwRV 
    - scanline animation
- Vertical hold drifting example: https://www.youtube.com/watch?v=TBTfEX6E0oM&ab_channel=Mike%27sAmateurArcadeMonitorRepair

## TODOs/Brainstorming
- update scanlines count to match NTSC 525 spec
    - note: only show 486 scanlines that make up the visible raster
- on a random interval trigger a vertical sync issue that causes the image to roll vertically
    - smacking the top right of the screen will trigger a vibration sensor switch that will "fix" the problem
- add hall effect sensors along the perimeter of the screen that will trigger screen distortion when a magnet is placed near them

- when I redo the wiring, these are the pins I should use:
```
                * RST           *
                * 3.3V        |-*
                * 3.3V     LiPo *
                * GND         |-*
        channel * A0        Bat *
         volume * A1         En *
       vignette * A2        USB * (+5V for fan)
                * A3        D13 *
      grayscale * D24       D12 *
      scanlines * D25       D11 *
  hor/vert hold * SCK       D10 *
 smell-o-vision * MO         D9 *
     vib-sensor * MI         D6 *
                * RX         D5 *
                * TX        SCL *
                * D4        SDA *
```