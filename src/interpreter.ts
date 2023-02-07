import type Keypad from "./keypad";
import type Screen from "./screen";
import Timer, { Buzzer } from "./timer";

type InstructionInfo = {
  opcode: number;
  instruction: number;
  x: number;
  y: number;
  n: number;
  nn: number;
  nnn: number;
};

function b64ToUint6(nChr: number) {
  return nChr > 64 && nChr < 91
    ? nChr - 65
    : nChr > 96 && nChr < 123
    ? nChr - 71
    : nChr > 47 && nChr < 58
    ? nChr + 4
    : nChr === 43
    ? 62
    : nChr === 47
    ? 63
    : 0;
}

export function base64DecToArr(sBase64: string, nBlocksSize: number) {
  const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, ""); // Only necessary if the base64 includes whitespace such as line breaks.
  const nInLen = sB64Enc.length;
  const nOutLen = nBlocksSize
    ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
    : (nInLen * 3 + 1) >> 2;
  const taBytes = new Uint8ClampedArray(nOutLen);

  let nMod3;
  let nMod4;
  let nUint24 = 0;
  let nOutIdx = 0;
  for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      nMod3 = 0;
      while (nMod3 < 3 && nOutIdx < nOutLen) {
        taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
        nMod3++;
        nOutIdx++;
      }
      nUint24 = 0;
    }
  }

  return taBytes;
}

export default class Interpreter {
  screen: Screen;
  keypad: Keypad;
  timer: Timer;
  buzzer: Buzzer;
  memory: Uint8Array;
  stack: number[];

  pc: number;
  i: number;
  v: Uint8Array;

  constructor(screen: Screen, keypad: Keypad, timer: Timer, buzzer: Buzzer) {
    this.screen = screen;
    this.keypad = keypad;
    this.timer = timer;
    this.buzzer = buzzer;
    const buffer = new ArrayBuffer(4096);
    this.memory = new Uint8Array(buffer);

    // Font
    this.memory.set(
      // prettier-ignore
      [
        0xf0, 0x90, 0x90, 0x90, 0xf0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xf0, 0x10, 0xf0, 0x80, 0xf0, // 2
        0xf0, 0x10, 0xf0, 0x10, 0xf0, // 3
        0x90, 0x90, 0xf0, 0x10, 0x10, // 4
        0xf0, 0x80, 0xf0, 0x10, 0xf0, // 5
        0xf0, 0x80, 0xf0, 0x90, 0xf0, // 6
        0xf0, 0x10, 0x20, 0x40, 0x40, // 7
        0xf0, 0x90, 0xf0, 0x90, 0xf0, // 8
        0xf0, 0x90, 0xf0, 0x10, 0xf0, // 9
        0xf0, 0x90, 0xf0, 0x90, 0x90, // A
        0xe0, 0x90, 0xe0, 0x90, 0xe0, // B
        0xf0, 0x80, 0x80, 0x80, 0xf0, // C
        0xe0, 0x90, 0x90, 0x90, 0xe0, // D
        0xf0, 0x80, 0xf0, 0x80, 0xf0, // E
        0xf0, 0x80, 0xf0, 0x80, 0x80, // F
      ],
      0x50
    );

    this.stack = [];
    this.pc = 0x200;
    this.i = 0x200;
    this.v = new Uint8Array(16);
  }

  load(rom: Uint8ClampedArray, start: number = 0x200) {
    this.memory.set(rom, start);
  }

  fetch(): number {
    const opcode = (this.memory[this.pc] << 8) | this.memory[this.pc + 1];
    this.pc += 2;
    return opcode;
  }

  decode(opcode: number): InstructionInfo {
    return {
      opcode,
      instruction: (opcode & (0xf << 12)) >> 12,
      x: (opcode & (0xf << 8)) >> 8,
      y: (opcode & (0xf << 4)) >> 4,
      n: opcode & 0xf,
      nn: opcode & 0xff,
      nnn: opcode & 0xfff,
    };
  }

  execute(instructionInfo: InstructionInfo) {
    const { opcode, instruction, x, y, n, nn, nnn } = instructionInfo;
    const vx = this.v[x],
      vy = this.v[y];

    const machineRoutines: { [opcode: number]: () => void } = {
      0x00e0: () => {
        // CLS
        this.screen.clear();
      },
      0x00ee: () => {
        // RET
        const location = this.stack.pop();
        if (location) {
          this.stack.push(this.pc);
          this.pc = location;
        } else {
          throw Error("Empty stack");
        }
      },
    };

    switch (instruction) {
      case 0x0:
        // SYS
        if (machineRoutines[opcode]) {
          machineRoutines[opcode]();
        } else {
          throw Error("Unknown machine routine");
        }
        break;
      case 0x1:
        // JP NNN
        this.pc = nnn;
        break;
      case 0x2:
        // CALL NNN
        this.stack.push(this.pc);
        this.pc = nnn;
        break;
      case 0x3:
        // SE VX NN
        if (vx === nn) {
          this.pc += 2;
        }
        break;
      case 0x4:
        // SNE VX NN
        if (vx !== nn) {
          this.pc += 2;
        }
        break;
      case 0x5:
        // SE VX VY
        if (vx === vy) {
          this.pc += 2;
        }
        break;
      case 0x6:
        // LD VX NN
        this.v[x] = nn;
        break;
      case 0x7:
        // ADD VX NN
        this.v[x] += nn;
        break;
      case 0x8:
        let result, shifted;
        switch (n) {
          case 0:
            // LD VX VY
            this.v[x] = vy;
            console.log(this.v);
            break;
          case 1:
            // OR VX VY
            this.v[x] = vx | vy;
            break;
          case 2:
            // AND VX VY
            this.v[x] = vx & vy;
            break;
          case 3:
            // XOR VX VY
            this.v[x] = vx ^ vy;
            break;
          case 4:
            // ADD VX VY
            result = vx + vy;
            this.v[x] = result;
            this.v[0xf] = result > 0xff ? 1 : 0;
            console.log(this.v);
            break;
          case 5:
            // SUB VX VY
            result = vx - vy;
            this.v[x] = result;
            this.v[0xf] = result > 0 ? 1 : 0;
            break;
          case 7:
            // SUBN VX VY
            result = vy - vx;
            this.v[x] = result;
            this.v[0xf] = result > 0 ? 1 : 0;
            break;
          case 6:
            // SHR VX VY
            // TODO: Flag for SUPER-CHIP
            shifted = vy & 0b1;
            this.v[x] = vy >> 1;
            this.v[0xf] = shifted;
            break;
          case 0xe:
            // SHL VX VY
            // TODO: Flag for SUPER-CHIP
            shifted = (vy & 0x80) >> 7;
            this.v[x] = vy << 1;
            this.v[0xf] = shifted;
            break;
        }
        break;
      case 0x9:
        // SNE VX VY
        if (vx !== vy) {
          this.pc += 2;
        }
        break;
      case 0xa:
        // LD I NNN
        this.i = nnn;
        break;
      case 0xb:
        // JP V0 NNN
        // TODO: Flag for SUPER-CHIP
        this.pc = nnn + this.v[0];
      case 0xc:
        // RND VX NN
        const r = Math.floor(Math.random() * 256);
        this.v[x] = r & nn;
      case 0xd:
        // DRW VX VY N
        const sprite = this.memory.slice(this.i, this.i + n);
        const flipped: boolean = this.screen.draw(sprite, vx, vy);
        this.v[0xf] = flipped ? 1 : 0;
        break;
      case 0xe:
        switch (nn) {
          case 0x9e:
            // SKP VX
            if (this.keypad.pressedKey === vx) {
              this.pc += 2;
            }
            break;
          case 0xa1:
            // SKNP VX
            if (this.keypad.pressedKey !== vx) {
              this.pc += 2;
            }
            break;
          default:
            throw Error(`Unknown instruction ${opcode.toString(16)}`);
        }
        break;
      case 0xf:
        switch (nn) {
          case 0x07:
            // LD VX DT
            this.v[x] = this.timer.get();
            break;
          case 0x15:
            this.timer.set(vx);
            break;
          case 0x18:
            this.buzzer.set(vx);
            break;
        }
        break;
      default:
        throw Error(`Unknown instruction ${opcode.toString(16)}`);
    }
  }

  step() {
    const opcode = this.fetch();
    const instructionInfo = this.decode(opcode);
    this.execute(instructionInfo);
  }
}
