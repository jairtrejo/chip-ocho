import Clock from "./clock";
import Interpreter, { base64DecToArr } from "./interpreter";
import Keypad from "./keypad";
import Screen from "./screen";
import Timer, {Buzzer} from "./timer";

const canvas = document.getElementById("screen") as HTMLCanvasElement;

const screen = new Screen(canvas);
const systemClock = new Clock(300);
const keypad = new Keypad();
const timerClock = new Clock(60);
const timer = new Timer(timerClock);
const buzzer = new Buzzer(timerClock);
const interpreter = new Interpreter(screen, keypad, timer, buzzer);

// IBM test program
//interpreter.load(
//base64DecToArr(
//"AOCiKmAMYQjQH3AJojnQH6JIcAjQH3AEolfQH3AIombQH3AIonXQHxIo/wD/ADwAPAA8ADwA/wD//wD/ADgAPwA/ADgA/wD/gADgAOAAgACAAOAA4ACA+AD8AD4APwA7ADkA+AD4AwAHAA8AvwD7APMA4wBD4ADgAIAAgACAAIAA4ADg",
//3
//)
//);


// prettier-ignore
interpreter.load(new Uint8ClampedArray([
  0x00, 0xE0, //0x200
  0x60, 0x1D, //0x202
  0x61, 0x0E, //0x204
  0xA4, 0x14, //0x206
  0x62, 0x06, //0x208
  0xE2, 0x9E, //0x20A
  0x12, 0x0A, //0x20C
  0xD0, 0x15, //0x20E
  0x64, 0x40, //0x210
  0xF4, 0x15, //0x212
  0xF4, 0x18, //0x214
  0xF5, 0x07, //0x216
  0x35, 0x00, //0x218
  0x12, 0x16, //0x21A
  0xD0, 0x15, //0x21C
  0x12, 0x0A, //0x21E
]), 0x200);

// prettier-ignore
interpreter.load(new Uint8ClampedArray([
  0b10000010, //0x414
  0b11111110,
  0b10111010,
  0b10111010,
  0b01111100,
  0b11111110, //0x419
  0b10111010,
  0b11111110,
  0b10000010,
  0b11111110,
]), 0x414);

systemClock.on(() => interpreter.step());
