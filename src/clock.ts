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

  on(callback: Callback) {
    this.callbacks.add(callback);

    if (this.callbacks.size == 1) {
      setTimeout(this.onAnimationFrame, 0);
    }
  }

  off(callback: Callback) {
    this.callbacks.delete(callback);
  }

  onAnimationFrame() {
    const now = performance.now();
    const last = this.last > 0 ? this.last : now - this.period;
    this.elapsed += now - last;

    if (this.elapsed >= this.period) {
      for (const callback of this.callbacks) {
        callback();
      }
      this.elapsed = 0;
    }

    this.last = now;

    if (this.callbacks.size > 0) {
      setTimeout(this.onAnimationFrame, 0);
    }
  }
}
