import digitalio
import rotaryio

# VolumeController is a class for managing a rotary encoder with a push button.
# ex: https://www.sparkfun.com/rotary-encoder-illuminated-rgb.html
# @see: https://docs.circuitpython.org/en/latest/shared-bindings/rotaryio/index.html
class VolumeController():
    def __init__(self, button_pin, a_pin, b_pin):
        self.button = digitalio.DigitalInOut(button_pin)
        self.button.direction = digitalio.Direction.INPUT
        self.button.pull = digitalio.Pull.UP

        self.encoder = rotaryio.IncrementalEncoder(a_pin, b_pin)

        self.cached_button_value = self.button.value
        self.cached_volume = self.encoder.position

    @property
    def muted(self):
        return self.button.value
    
    @property
    def volume(self):
        return self.encoder.position

    def read_volume(self) -> None:
        new_volume = self.volume
        if new_volume is not self.cached_volume:
            # "An IncrementalEncoder tracks the positional state of an incremental rotary encoder (a.k.a. a quadrature encoder.) 
            #  Position is relative to the position when the object is constructed.""
            volume_direction = "up" if new_volume > self.cached_volume else "down"
            self.cached_volume = new_volume
            print("sensor:volume:{}".format(volume_direction))

    def read_mute(self) -> None:
        new_button_value = self.muted
        if new_button_value is not self.cached_button_value:
            self.cached_button_value = new_button_value
            print("sensor:mute:pressed")        
