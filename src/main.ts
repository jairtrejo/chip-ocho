import Clock from "./clock";
import Interpreter, { base64DecToArr } from "./interpreter";
import Screen from "./screen";

const canvas = document.getElementById("screen") as HTMLCanvasElement;
const screen = new Screen(canvas);
const clock = new Clock(300);
const interpreter = new Interpreter(screen);

// IBM test program
interpreter.load(
  base64DecToArr(
    "AOCiKmAMYQjQH3AJojnQH6JIcAjQH3AEolfQH3AIombQH3AIonXQHxIo/wD/ADwAPAA8ADwA/wD//wD/ADgAPwA/ADgA/wD/gADgAOAAgACAAOAA4ACA+AD8AD4APwA7ADkA+AD4AwAHAA8AvwD7APMA4wBD4ADgAIAAgACAAIAA4ADg",
    3
  )
);

clock.on(() => interpreter.step());
