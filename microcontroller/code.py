import time
import board
# from rotary_switch import RotaryNPositionSwitch
#from volume_controller import VolumeController
from on_off_switch import OnOffSwitch

# Unused, saved for future use
#from servo_controller import ServoController

# switch_pin = board.D13
# rotary_switch_pin = board.A1
# volume_pot_pin = board.A2 # save for future use, will switch to log potentiometer
#vignette_pot_pin = board.A3

#vol_button_pin = board.D11
#vol_enc_b_pin = board.D10
#vol_enc_a_pin = board.D9
#smell_o_vision_fan_tach_pin = board.D6
#smell_o_vision_fan_rpm_pin = board.D5
grayscale_switch_pin = board.A1 #D4, just testing for now
#scanline_switch_pin = board.TX
#servo_pin = board.A3

# Channel Knob (10 position)
#rotary_switch = RotaryNPositionSwitch(rotary_switch_pin, 10)
#volume_controller = VolumeController(vol_button_pin, vol_enc_a_pin, vol_enc_b_pin)
grayscale_switch = OnOffSwitch(grayscale_switch_pin, "scanlines")
#scanline_switch = OnOffSwitch(scanline_switch_pin, "scanline")

#servo_controller = ServoController(servo_pin)
#servo_controller.sweep()

# Gets a % voltage from an analog pin
def get_voltage(pin):
    ref_voltage = pin.reference_voltage
    voltage = (pin.value * ref_voltage) / 65535
    return round(voltage / ref_voltage, 2)

while True:
    # volume encoder
    #volume_controller.read_volume()
    # mute button
    #volume_controller.read_mute()   

    # rotary encoder
    # rotary_switch.read_channel()
    
    # b&w switch
    grayscale_switch.read_switch()
    
    # scanline switch
    #scanline_switch.read_switch( )
    
    # vignette/barrel distortion potentiometer
    # @todo
    
    # smell-o-vision
    # @todo
    
    time.sleep(0.1)
    pass
