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

        self.cached_button = self.button.value
        self.cached_volume = self.encoder.position

        self.volume_direction = None

    @property
    def muted(self):
        return not self.button.value
    
    @property
    def volume(self):
        return self.encoder.position
    
    @property
    def has_muted_changed(self):
        print("self.muted: ", self.muted)
        if self.cached_button is not self.muted:
            self.cached_button = self.muted
            return True
        return False

    def read_volume(self) -> None:
        if self.cached_volume is not self.volume:
            # "An IncrementalEncoder tracks the positional state of an incremental rotary encoder (a.k.a. a quadrature encoder.) 
            #  Position is relative to the position when the object is constructed.""
            volume_direction = "up" if self.volume > self.cached_volume else "down"
            self.cached_volume = self.volume
            print("sensor:volume:{}".format(volume_direction))

    def read_mute(self) -> None:
        if self.cached_button is not self.button.value:
            self.cached_button = self.button.value
            print("sensor:mute:pressed")        
