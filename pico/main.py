import time
import board
import analogio
import digitalio
import rotaryio

switch_pin = board.D13
rot_enc_pin = board.A1
vol_button_pin = board.D11
vol_enc_a_pin = board.D9
vol_enc_b_pin = board.D10

# switch
switch = digitalio.DigitalInOut(switch_pin)
switch.direction = digitalio.Direction.INPUT
switch.pull = digitalio.Pull.UP

# volume button
vol_button = digitalio.DigitalInOut(vol_button_pin)
vol_button.direction = digitalio.Direction.INPUT
vol_button.pull = digitalio.Pull.UP

# rotary encoder
rotary_encoder = analogio.AnalogIn(rot_enc_pin)

# volume encoder
vol_encoder = rotaryio.IncrementalEncoder(vol_enc_a_pin, vol_enc_b_pin)

def get_voltage(pin):
    voltage = (pin.value * 3.3) / 65536
    return round(voltage / 3.3, 2)


def get_channel(pin):
    return int((rotary_encoder.value / 65536) * 10)


cached_switch = switch.value == True
cached_vol_button = vol_button.value
cached_channel = rotary_encoder.value
cached_vol_enc = vol_encoder.position

vol_state = None

while True:
  
    # volume button
    if cached_vol_button is not vol_button.value:
        cached_vol_button = vol_button.value
        if vol_button.value is False and vol_state is None:
            vol_state = "pressed"
        if vol_button.value and vol_state == "pressed":
            vol_state = None    
            print("sensor:mute:pressed")        

    # volume encoder
    curr_volume = vol_encoder.position
    if cached_volume is not curr_volume:
        vol_direction = "up" if curr_volume > cached_volume else "down"
        cached_volume = curr_volume
        print("sensor:volume:{}".format(vol_direction))

    # rotary encoder
    curr_channel = get_channel(rotary_encoder)
    if cached_channel is not curr_channel:
        cached_channel = curr_channel
        # print("rotary_encoder.reference_voltage: ", rotary_encoder.reference_voltage)
        print("sensor:channel:{}".format(curr_channel))

    
    time.sleep(0.1)
    pass

