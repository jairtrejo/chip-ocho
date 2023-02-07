function offset(n: number) {
  let offset = 0;
  const pow = 2 ** Math.floor(Math.log2(n));
  if (pow !== n) {
    offset = (n - pow) / 2;
  }
  return [offset, pow];
}

export default class Screen {
  canvasWidth: number;
  canvasHeight: number;
  canvasContext: CanvasRenderingContext2D;
  screenCanvas: OffscreenCanvas;
  screenContext: OffscreenCanvasRenderingContext2D;

  static width = 64;
  static height = 32;

  constructor(canvas: HTMLCanvasElement) {
    this.canvasHeight = canvas.clientHeight;
    this.canvasWidth = canvas.clientWidth;
    this.canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Adjust canvas width and height to match dimensions
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(this.canvasWidth * scale);
    canvas.height = Math.floor(this.canvasHeight * scale);
    this.canvasContext.scale(scale, scale);

    // Disable smoothing
    this.canvasContext.imageSmoothingEnabled = false;

    this.screenCanvas = new OffscreenCanvas(64, 32);
    this.screenContext = this.screenCanvas.getContext("2d", {
      willReadFrequently: true,
    }) as OffscreenCanvasRenderingContext2D;

    this.clear();
  }

  clear() {
    this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.screenContext.clearRect(0, 0, Screen.width, Screen.height);
    this.canvasContext.fillStyle = "#000";
    this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  _sync() {
    const [xOffset, w] = offset(this.canvasWidth);
    const [yOffset, h] = offset(this.canvasHeight);

    this.canvasContext.drawImage(this.screenCanvas, xOffset, yOffset, w, h);
  }

  draw(sprite: Uint8Array, x: number, y: number) {
    x = x % 64;
    y = y % 32;
    const w = 8;
    const h = sprite.length;

    const imageData = this.screenContext.getImageData(x, y, w, h);
    const screenData = new Uint8ClampedArray(imageData.data.length / 32);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const offset = 7 - ((i / 4) % 8);
      screenData[Math.floor(i / 32)] |=
        (imageData.data[i] > 0 ? 1 : 0) << offset;
    }

    let flipped = false;
    for (let i = 0; i < sprite.length; ++i) {
      if ((screenData[i] & sprite[i]) > 0) {
        flipped = true;
      }
      screenData[i] ^= sprite[i];
    }

    for (let i = 0; i < imageData.data.length; i += 4) {
      const offset = 7 - ((i / 4) % 8);
      const bit = screenData[Math.floor(i / 32)];
      const lit = (bit & (1 << offset)) >> offset > 0;
      if (lit) {
        imageData.data[i] = 255;
        imageData.data[i + 1] = 176;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 255;
      } else {
        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = 255;
      }
    }

    this.screenContext.putImageData(imageData, x, y);
    this._sync();
    return flipped;
  }
}
