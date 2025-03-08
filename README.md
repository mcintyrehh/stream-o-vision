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
- Adafruit Featherwing OLED: https://learn.adafruit.com/adafruit-128x64-oled-featherwing/circuitpython