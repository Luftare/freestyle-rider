export default class Fx {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shakeCounter = 0;
    this.shakeDamp = 30;
    this.shakeFrequency = 1;
    this.shakeAmplitude = 3;
  }

  update(dt) {
    this.shakeCounter -= dt * this.shakeDamp;
    this.shakeCounter = Math.max(0, this.shakeCounter);

    const radians = Date.now() * 40 * this.shakeFrequency * dt;
    const offsetX = Math.cos(radians * 1.4) * this.shakeAmplitude * this.shakeCounter;
    const offsetY = Math.cos(radians) * this.shakeAmplitude * this.shakeCounter;
    this.ctx.translate(offsetX, offsetY);
  }

  shake(amount = 10) {
    this.shakeCounter = amount;
  }
}