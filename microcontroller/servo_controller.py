import time
import pwmio
from adafruit_motor import servo

class ServoController():
    def __init__(self, pin):
        self.pwm = pwmio.PWMOut(pin, duty_cycle=2 ** 15, frequency=50)
        self.servo = servo.Servo(self.pwm)

    def sweep(self):
        while True:
            for angle in range(0, 180, 5):
                print("Servo angle: ", self.servo.angle)
                print("  Updating to ", angle)
                self.servo.angle = angle
                time.sleep(0.05)  
            for angle in range(180, 0, -5):
                self.servo.angle = angle
                time.sleep(0.05)