import Clock from "./clock";

export class Timer {
  clock: Clock;
  t: number = 0;

  constructor(clock: Clock) {
    this.clock = clock;
    this._decrement = this._decrement.bind(this);
  }

  set(t: number) {
    if (this.t === 0 && t > 0) {
      this.clock.on(this._decrement);
    }
    this.t = t;
  }

  get() {
    return this.t;
  }

  _decrement() {
    this.t -= 1;

    if (this.t === 0) {
      this.clock.off(this._decrement);
    }
  }
}

export class Buzzer extends Timer {
  audioContext: AudioContext;
  oscillatorNode: OscillatorNode;
  gainNode: GainNode;

  constructor(clock: Clock) {
    super(clock);
    this.audioContext = new AudioContext();

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.01;

    this.oscillatorNode = this.audioContext.createOscillator();
    this.oscillatorNode.frequency.value = 440;
    this.oscillatorNode.type = "square";

    this.oscillatorNode.start();
    this.gainNode.connect(this.audioContext.destination);
  }

  _startBuzzer() {
    const body = document.querySelector("body");
    if (body) {
      body.style.backgroundColor = "#c00";
    }
    this.oscillatorNode.connect(this.gainNode);
  }

  _stopBuzzer() {
    const body = document.querySelector("body");
    if (body) {
      body.style.backgroundColor = "#fff";
    }
    this.oscillatorNode.disconnect(this.gainNode);
  }

  set(t: number) {
    if (this.t === 0 && t > 0) {
      this._startBuzzer();
    }
    super.set(t);
  }

  _decrement() {
    super._decrement();
    if (this.t === 0) {
      this._stopBuzzer();
    }
  }
}

export default Timer;
