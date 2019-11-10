import Vector from 'vector';
import { metersToPixels } from './Graphics';

export default class SparkParticle {
  constructor(position) {
    this.position = new Vector(position);
    this.radius = metersToPixels(1 + Math.random() * 5) / 40;
    this.velocity = new Vector().random(50 + Math.random() * 50).scale(metersToPixels(1 / 40));
    this.fadeVelocity = 4;
    this.color = Math.random() > 0.5 ? 'orange' : 'yellow';
    this.life = Math.random();
  }

  update(dt) {
    this.life -= this.fadeVelocity * dt;
    this.life = Math.max(this.life, 0);
    this.position.scaledAdd(dt, this.velocity);
  }

  render(paint) {
    paint.rect({
      position: this.position,
      width: this.radius,
      height: this.radius,
      fill: this.color
    });
  }
}
