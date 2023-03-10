type Callback = () => any;

export default class Clock {
  period: number;
  callbacks: Set<Callback>;
  last: number;
  elapsed: number;

  constructor(frequency: number) {
    this.period = 1000 / frequency;
    this.callbacks = new Set();
    this.last = -1;
    this.elapsed = 0;

    this.onAnimationFrame = this.onAnimationFrame.bind(this);
  }

  _schedule(f: () => void) {
    requestAnimationFrame(f);
  }

  on(callback: Callback) {
    this.callbacks.add(callback);

    if (this.callbacks.size == 1) {
      this._schedule(this.onAnimationFrame);
    }
  }

  off(callback: Callback) {
    this.callbacks.delete(callback);
  }

  onAnimationFrame() {
    const now = performance.now();
    const last = this.last > 0 ? this.last : now - this.period;
    this.elapsed += now - last;

    const pending = Math.floor(this.elapsed / this.period);

    if (pending > 1) {
      for (const callback of this.callbacks) {
        for (let i = 0; i < pending; ++i) {
          callback();
        }
      }
      this.elapsed = 0;
    }

    this.last = now;

    if (this.callbacks.size > 0) {
      this._schedule(this.onAnimationFrame);
    }
  }
}
