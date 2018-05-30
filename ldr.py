#!/usr/local/bin/python

import RPi.GPIO as GPIO
import time, json

GPIO.setmode(GPIO.BCM)

#define the pin that goes to the circuit
pin_to_circuit = 4

#define status of light
lightOn  = False;

def rc_time (pin_to_circuit):
    count = 0

    #Output on the pin for
    GPIO.setup(pin_to_circuit, GPIO.OUT)
    GPIO.output(pin_to_circuit, GPIO.LOW)
    time.sleep(0.1)

    #Change the pin back to input
    GPIO.setup(pin_to_circuit, GPIO.IN)

    #Count until the pin goes high
    while (GPIO.input(pin_to_circuit) == GPIO.LOW):
        count += 1

    return count


def ledOn ():
   GPIO.setwarnings(False)
   GPIO.setup(18,GPIO.OUT)
   print "LED on"
   GPIO.output(18,GPIO.HIGH)

def ledOff ():
   print "LED off"
   GPIO.setup(18,GPIO.OUT)
   GPIO.output(18,GPIO.LOW)

def lightStatus():
    try:
        jsonFile = \
            open('/home/rasp/Documents/OSLMiniProject-master/lightData.json'
                 , 'r')
        data = json.load(jsonFile)
        jsonFile.close
        value = data['lights'][0]['status']
        return value
    except:
        print 'Test'


#Catch when script is interrupted, cleanup correctly
try:
    # Main loop
    while True:
        lightOn = lightStatus()
        print lightOn
        if lightOn == "true":
            count = rc_time(pin_to_circuit)
            print count
            if(count > 666):
                ledOn()
            else:
                ledOff()
        else:
            ledOff()
            print("light not on")

except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
