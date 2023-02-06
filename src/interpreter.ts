import type Screen from "./screen";

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
  memory: Uint8ClampedArray;
  stack: number[];

  pc: number;
  i: number;
  v: Uint8ClampedArray;

  constructor(screen: Screen) {
    this.screen = screen;
    const buffer = new ArrayBuffer(4096);
    this.memory = new Uint8ClampedArray(buffer);

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
    this.v = new Uint8ClampedArray(16);
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
    const vx = this.v[x], vy = this.v[y];

    if (opcode === 0x00e0) {
      this.screen.clear();
      return;
    }

    switch (instruction) {
      case 0x1:
        this.pc = nnn;
        break;
      case 0x6:
        this.v[x] = nn;
        break;
      case 0x7:
        this.v[x] += nn;
        break;
      case 0xa:
        this.i = nnn;
        break;
      case 0xd:
        const sprite = this.memory.slice(this.i, this.i + n);
        const flipped: boolean = this.screen.draw(sprite, vx, vy);
        this.v[0xf] = flipped ? 1 : 0;
        break;
    }
  }
}
