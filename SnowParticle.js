import Vector from 'vector';

export default class SnowParticle {
  constructor(position) {
    this.position = new Vector(position);
    this.radius = 3 + Math.random() * 2;
    this.fadeVelocity = 0.5;
    this.life = Math.random();
  }

  update(dt) {
    this.life -= this.fadeVelocity * dt;
    this.life = Math.max(this.life, 0);
    this.position.addX((Math.random() - 0.5) * 2);
    this.position.addY((Math.random() - 0.5) * 2);
  }

  render(paint) {
    paint.circle({
      position: this.position,
      radius: this.radius + (1 - this.life) * this.radius * 2,
      fill: 'white',
      alpha: this.life
    });
  }
}
