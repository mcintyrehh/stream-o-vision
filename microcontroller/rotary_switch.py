import analogio

# Switch Class for managing a 10 position rotary switch
# ex: https://www.sparkfun.com/rotary-switch-10-position.html

class RotarySwitch():
    def __init__(self, pin):
        self.switch = analogio.AnalogIn(pin)
        # self.switch.direction = analogio.Direction.INPUT
        # self.switch.pull = analogio.Pull.UP

        self.cached_channel = self.channel
        print("RotarySwitch reference_voltage: ", self.switch.reference_voltage)


    def get_channel(self):
        # "For ADC values in CircuitPython you’ll find they’re all put into the range of 16-bit unsigned values. 
        #  This means the possible values you’ll read from the ADC fall within the range of 0 to 65535"
        return int((self.switch.value / 65535) * 10)
    
    @property
    def value(self):
        return self.switch._value
    
    @property
    def channel(self):
        return self.get_channel()
    
    @property
    def has_changed(self):
        if self.cached_channel is not self.channel:
            self.cached_channel = self.channel
            return True
        return False