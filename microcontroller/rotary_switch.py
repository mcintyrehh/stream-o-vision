import analogio

# RotarySwitch Class for managing a 10 position rotary switch
# ex: https://www.sparkfun.com/rotary-switch-10-position.html

class RotaryNPositionSwitch():
    def __init__(self, pin, num_positions=10):
        self.rotary_switch = analogio.AnalogIn(pin)
        self.num_positions = num_positions
        self.cached_channel = self.channel
        print("RotarySwitch reference_voltage: ", self.rotary_switch.reference_voltage)


    def get_channel(self):
        # "For ADC values in CircuitPython you’ll find they’re all put into the range of 16-bit unsigned values. 
        #  This means the possible values you’ll read from the ADC fall within the range of 0 to 65535"
        return int((self.rotary_switch.value / 65535) * self.num_positions)
    
    @property
    def value(self):
        return self.rotary_switch._value
    
    @property
    def channel(self):
        return self.get_channel()
    
    def read_channel(self):
        new_channel = self.channel
        if new_channel is not self.cached_channel:
            self.cached_channel = new_channel
            print("sensor:channel:{}".format(new_channel))
