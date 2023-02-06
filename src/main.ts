import Clock from "./clock";
import Interpreter, { base64DecToArr } from "./interpreter";
import Screen from "./screen";

const canvas = document.getElementById("screen") as HTMLCanvasElement;
const screen = new Screen(canvas);
const clock = new Clock(300);
const interpreter = new Interpreter(screen);

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
  0x62, 0xFF, //0x202
  0x63, 0x00, //0x204
  0xA2, 0x14, //0x216
  0x92, 0x30, //0x208
  0xA2, 0x19, //0x20A
  0x60, 0x1D, //0x20C
  0x61, 0x0D, //0x20E
  0xD0, 0x15, //0x210
  0x12, 0x12, //0x212
  0b10000010, //0x214
  0b11111110,
  0b10111010,
  0b10111010,
  0b01111100,
  0b11111110, //0x219
  0b10111010,
  0b11111110,
  0b10000010,
  0b11111110,
]), 0x200);

clock.on(() => interpreter.step());
