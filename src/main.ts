import Clock from "./clock";
import Interpreter, { base64DecToArr } from "./interpreter";
import Keypad from "./keypad";
import Screen from "./screen";
import Timer, { Buzzer } from "./timer";

const canvas = document.getElementById("screen") as HTMLCanvasElement;

const screen = new Screen(canvas);
const systemClock = new Clock(1000);
const keypad = new Keypad();
const timerClock = new Clock(60);
const timer = new Timer(timerClock);
const buzzer = new Buzzer(timerClock);
const interpreter = new Interpreter(screen, keypad, timer, buzzer);

// Test ROM
interpreter.load(
  base64DecToArr(
    // IBM test program
    //"AOCiKmAMYQjQH3AJojnQH6JIcAjQH3AEolfQH3AIombQH3AIonXQHxIo/wD/ADwAPAA8ADwA/wD//wD/ADgAPwA/ADgA/wD/gADgAOAAgACAAOAA4ACA+AD8AD4APwA7ADkA+AD4AwAHAA8AvwD7APMA4wBD4ADgAIAAgACAAIAA4ADg",
    // Test cart (https://github.com/corax89/chip8-test-rom)
    "Ek7qrKrqzqqqruCgoODAQEDg4CDA4OBgIOCg4CAgYEAgQOCA4ODgICAg4OCg4ODgIOBAoOCg4MCA4OCAwICgQKCgogLatADuogLatBPcaAFpBWoKawFlKmYrohbYtKI+2bSiAjYrogbatGsGohrYtKI+2bSiBkUqogLatGsLoh7YtKI+2bSiBlVgogLatGsQoibYtKI+2bSiBnb/RiqiAtq0axWiLti0oj7ZtKIGlWCiAtq0axqiMti0oj7ZtCJCaBdpG2ogawGiCti0ojbZtKIC2rRrBqIq2LSiCtm0ogaHUEcqogLatGsLoirYtKIO2bSiBmcqh7FHK6IC2rRrEKIq2LSiEtm0ogZmeGcfh2JHGKIC2rRrFaIq2LSiFtm0ogZmeGcfh2NHZ6IC2rRrGqIq2LSiGtm0ogZmjGeMh2RHGKIC2rRoLGkwajRrAaIq2LSiHtm0ogZmjGd4h2VH7KIC2rRrBqIq2LSiItm0ogZm4IZuRsCiAtq0awuiKti0ojbZtKIGZg+GZkYHogLatGsQojrYtKIe2bSj6GAAYTDxVaPp8GWiBkAwogLatGsVojrYtKIW2bSj6GaJ9jPyZaICMAGiBjEDogYyB6IG2rRrGqIO2LSiPtm0EkgT3A==",
    3
  )
);

systemClock.on(() => interpreter.step());
