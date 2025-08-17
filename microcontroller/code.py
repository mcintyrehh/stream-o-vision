import time
import board

from rotary_switch import RotaryNPositionSwitch
from volume_controller import VolumeController
from on_off_switch import OnOffSwitch


# switch_pin = board.D13
rotary_switch_pin = board.A1
volume_pot_pin = board.A2 # save for future use, will switch to log potentiometer

vol_button_pin = board.D11
vol_enc_b_pin = board.D10
vol_enc_a_pin = board.D9
#smell_o_vision_fan_tach_pin = board.D6
#smell_o_vision_fan_rpm_pin = board.D5

grayscale_switch_pin = board.SDA
scanline_switch_pin = board.SCL
barrel_distortion_switch_pin = board.D12
horizontal_hold_switch_pin = board.D13 # this should be a pot or something, just testing now

# Channel Knob (10 position)
rotary_switch = RotaryNPositionSwitch(rotary_switch_pin, 10)
volume_controller = VolumeController(vol_button_pin, vol_enc_a_pin, vol_enc_b_pin)

# "Feature" Switches 
grayscale_switch = OnOffSwitch(grayscale_switch_pin, "grayscale")
scanline_switch = OnOffSwitch(scanline_switch_pin, "scanline")
barrel_distortion_switch = OnOffSwitch(barrel_distortion_switch_pin, "barrel_distortion")
horizontal_hold_switch = OnOffSwitch(horizontal_hold_switch_pin, "horizontal_hold")

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
    
    # b&w switch
    grayscale_switch.read_switch()
    
    # # scanline switch
    scanline_switch.read_switch()
    
    # vignette/barrel distortion potentiometer
    barrel_distortion_switch.read_switch()

    # horizontal hold switch (should be pot or something)
    horizontal_hold_switch.read_switch()

    time.sleep(0.1)
    pass
