export default class Keypad {
  pressedKey: number | null = null;

  // prettier-ignore
  static keyMap: { [keyCode: string]: number } = {
    Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 0xC,
    KeyQ: 4, KeyW: 5, KeyE: 6, KeyR: 0xD,
    KeyA: 7, KeyS: 8, KeyD: 9, KeyF: 0xE,
    KeyZ: 0xA, KeyX: 0, KeyC: 0xB, KeyV: 0xF,
  };

  constructor() {
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    document.addEventListener("keydown", this._onKeyDown);
    document.addEventListener("keyup", this._onKeyUp);
  }

  _onKeyDown(e: KeyboardEvent) {
    const pressedKey = e.code;
    this.pressedKey = Keypad.keyMap[pressedKey];
  }

  _onKeyUp(e: KeyboardEvent) {
    const releasedKey = e.code;
    if (this.pressedKey == Keypad.keyMap[releasedKey]) {
      this.pressedKey = null;
    }
  }

  getPressedKey() {
    return this.pressedKey;
  }
}
