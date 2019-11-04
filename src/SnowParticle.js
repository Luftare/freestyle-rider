import Vector from 'vector';

export default class SnowParticle {
  constructor(position) {
    this.position = new Vector(position);
    this.radius = 5 + Math.random() * 2;
    this.velocity = new Vector().random(20).scale(Math.random());
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
      radius: this.radius + (1 - this.life) * this.radius,
      fill: 'white',
      alpha: this.life
    });
  }
}
