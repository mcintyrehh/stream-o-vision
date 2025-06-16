import time
import board
from rotary_switch import RotarySwitch
from volume_controller import VolumeController
from servo_controller import ServoController

# switch_pin = board.D13
rotary_switch_pin = board.A1
vol_button_pin = board.D11
vol_enc_a_pin = board.D9
vol_enc_b_pin = board.D10
#servo_pin = board.A3

# Channel Knob
rotary_switch = RotarySwitch(rotary_switch_pin)
volume_controller = VolumeController(vol_button_pin, vol_enc_a_pin, vol_enc_b_pin)
#servo_controller = ServoController(servo_pin)

#servo_controller.sweep()

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

