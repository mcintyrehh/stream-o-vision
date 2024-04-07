import time

import board
import analogio
import digitalio
import terminalio

switch_pin = board.D10
pot_pin = board.A3
rot_enc_pin = board.A1

# switch
switch = digitalio.DigitalInOut(switch_pin)
switch.direction = digitalio.Direction.INPUT
switch.pull = digitalio.Pull.UP

# potentiometer
potentiometer = analogio.AnalogIn(pot_pin)

# rotary encoder
channel_encoder = analogio.AnalogIn(rot_enc_pin)


def get_voltage(pin):
    voltage = (pin.value * 3.3) / 65536
    return round(voltage / 3.3, 2)


def get_channel(pin):
    return int((channel_encoder.value / 65536) * 10)


cached_switch = switch.value == True
cached_volume = get_voltage(potentiometer)
cached_channel = channel_encoder.value

while True:

    # switch
    if cached_switch is not switch.value:
        cached_switch = switch.value
        if switch.value:
            print("Power On")
        else:
            print("Power Off")

    # potentiometer
    #curr_volume = get_voltage(potentiometer)
    #if cached_volume is not curr_volume:
    #    cached_volume = curr_volume
    #    print("Volume: ", curr_volume)

    # rotary encoder
    curr_channel = get_channel(channel_encoder)
    if cached_channel is not curr_channel:
        cached_channel = curr_channel
        # print("rotary_encoder.reference_voltage: ", rotary_encoder.reference_voltage)
        print("sensor:channel:{}".format(curr_channel))

    # Draw some label text
    power_status = "Power On" if switch.value else "Power Off"  # overly long to see where it clips
#    text_area = label.Label(terminalio.FONT, text=power_status, color=0xFFFFFF, x=8, y=8)
#    splash.append(text_area)

    time.sleep(0.1)
    pass

