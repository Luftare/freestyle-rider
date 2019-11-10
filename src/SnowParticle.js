import Vector from 'vector';
import { metersToPixels } from './Graphics';

export default class SnowParticle {
  constructor(position) {
    this.position = new Vector(position);
    this.radius = metersToPixels(6 + Math.random() * 2) / 40;
    this.velocity = new Vector().random(20).scale(Math.random()).scale(metersToPixels(1 / 40));
    this.fadeVelocity = 0.3;
    this.life = Math.random();
  }

  update(dt) {
    this.life -= this.fadeVelocity * dt;
    this.life = Math.max(this.life, 0);
    this.position.scaledAdd(dt, this.velocity);
  }

  render(paint) {
    paint.circle({
      position: this.position,
      radius: this.radius + 2 * (1 - this.life) * this.radius,
      fill: 'white',
      alpha: this.life * 0.5
    });
  }
}
