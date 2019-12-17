import Vector from 'vector';
import { metersToPixels } from './Graphics';

export default class SnowParticle {
  constructor(position, velocity) {
    this.position = new Vector(position);
    this.radius = metersToPixels(6 + Math.random() * 2) / 40;
    const angleDiff = 0.5 * (Math.random() - 0.5);
    this.velocity = velocity.rotate(angleDiff).scale(0.3);
    this.fadeVelocity = 0.2;
    this.life = Math.random();
  }

  update(dt) {
    this.life -= this.fadeVelocity * dt;
    this.life = Math.max(this.life, 0);
    this.velocity.stretch(-dt * 100);
    this.position.scaledAdd(dt, this.velocity);
  }

  render(paint) {
    paint.circle({
      position: this.position,
      radius: this.radius + 2 * (1 - this.life) * this.radius,
      fill: '#fff',
      alpha: this.life * 0.5,
    });
  }
}
