import time
import board
from rotary_switch import RotarySwitch
from volume_controller import VolumeController

# switch_pin = board.D13
rotary_switch_pin = board.A1
vol_button_pin = board.D11
vol_enc_a_pin = board.D9
vol_enc_b_pin = board.D10
servo_pin = board.A2

# Channel Knob
rotary_switch = RotarySwitch(rotary_switch_pin)
volume_controller = VolumeController(vol_button_pin, vol_enc_a_pin, vol_enc_b_pin)

# Gets a % voltage from an analog pin
def get_voltage(pin):
    ref_voltage = pin.reference_voltage
    voltage = (pin.value * ref_voltage) / 65535
    return round(voltage / ref_voltage, 2)

while True:
    # volume encoder
    volume_controller.read_volume()
    # mute button
    volume_controller.read_mute()   

    # rotary encoder
    rotary_switch.read_channel()
    
    time.sleep(0.1)
    pass

