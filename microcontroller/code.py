import time
import board
import digitalio
import rotaryio
from rotary_switch import RotarySwitch

# switch_pin = board.D13
rotary_switch_pin = board.A1
vol_button_pin = board.D11
vol_enc_a_pin = board.D9
vol_enc_b_pin = board.D10
servo_pin = board.A2

# rotary switch
rotary_switch = RotarySwitch(rotary_switch_pin)

# volume button
vol_button = digitalio.DigitalInOut(vol_button_pin)
vol_button.direction = digitalio.Direction.INPUT
vol_button.pull = digitalio.Pull.UP

# volume encoder
vol_encoder = rotaryio.IncrementalEncoder(vol_enc_a_pin, vol_enc_b_pin)

def get_voltage(pin):
    voltage = (pin.value * 3.3) / 65536
    return round(voltage / 3.3, 2)

cached_volume = 0
cached_vol_button = vol_button.value
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
    if rotary_switch.has_changed:
        print("sensor:channel:{}".format(rotary_switch.channel))

    
    time.sleep(0.1)
    pass

