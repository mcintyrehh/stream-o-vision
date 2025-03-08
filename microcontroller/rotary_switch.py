import analogio

# RotarySwitch Class for managing a 10 position rotary switch
# ex: https://www.sparkfun.com/rotary-switch-10-position.html

class RotarySwitch():
    def __init__(self, pin):
        self.rotary_switch = analogio.AnalogIn(pin)

        self.cached_channel = self.channel
        print("RotarySwitch reference_voltage: ", self.rotary_switch.reference_voltage)


    def get_channel(self):
        # "For ADC values in CircuitPython you’ll find they’re all put into the range of 16-bit unsigned values. 
        #  This means the possible values you’ll read from the ADC fall within the range of 0 to 65535"
        return int((self.rotary_switch.value / 65535) * 10)
    
    @property
    def value(self):
        return self.rotary_switch._value
    
    @property
    def channel(self):
        return self.get_channel()
    
    def read_channel(self):
        if self.cached_channel is not self.channel:
            self.cached_channel = self.channel
            print("sensor:channel:{}".format(self.channel))
