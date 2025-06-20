import digitalio

# OnOffSwitch is a class for managing a simple on/off switch.
# ex: a rotary lamp switch
class OnOffSwitch():
    def __init__(self, pin, switch_name):
        self.switch = digitalio.DigitalInOut(pin)
        self.switch.direction = digitalio.Direction.INPUT
        self.switch.pull = digitalio.Pull.UP

        self.switch_name = switch_name
        self.cached_switch_value = self.switch.value
        print(f"Initialized switch {self.switch_name} on pin {pin}")

    @property
    def is_on(self):
        # Pull-up resistors mean that the switch is "on" when the value is False
        return not self.switch.value 

    def read_switch(self):
        new_switch_value = self.is_on
        if new_switch_value != self.cached_switch_value:
            self.cached_switch_value = new_switch_value
            switch_state = "on" if new_switch_value else "off"

            print(f"sensor:{self.switch_name}:{switch_state}")