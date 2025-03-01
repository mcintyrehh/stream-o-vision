# stream-o-vision


## Serial Port Debugging

List serial ports with:
`sudo dmesg | grep tty`

Can monitor serial port with:
`sudo minicom -b 115200 -o -D /dev/ttyACM0`

"can't open device "/dev/ttyACM0": Permission denied" error?
  You need to add yourself to the dialout group:
  `sudo usermod -a -G dialout $USER`
  then log out and back in, or restart to apply changes.


## Docs
- Adafruit Featherwing OLED: https://learn.adafruit.com/adafruit-128x64-oled-featherwing/circuitpython