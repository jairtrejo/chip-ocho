import Interpreter, { base64DecToArr } from "./interpreter";
import Screen from "./screen";

const canvas = document.getElementById("screen") as HTMLCanvasElement;
const screen = new Screen(canvas);
const interpreter = new Interpreter(screen);

// IBM test program
interpreter.load(
  base64DecToArr(
    "AOCiKmAMYQjQH3AJojnQH6JIcAjQH3AEolfQH3AIombQH3AIonXQHxIo/wD/ADwAPAA8ADwA/wD//wD/ADgAPwA/ADgA/wD/gADgAOAAgACAAOAA4ACA+AD8AD4APwA7ADkA+AD4AwAHAA8AvwD7APMA4wBD4ADgAIAAgACAAIAA4ADg",
    3
  )
);

for (let i = 0; i< 21; ++i){
  const opcode = interpreter.fetch();
  const instructionInfo = interpreter.decode(opcode);
  interpreter.execute(instructionInfo);
}
