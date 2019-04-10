import Vector from 'vector';
import Paint from 'paint';

const canvas = document.querySelector('canvas');
const paint = new Paint(canvas);

class Player {
  constructor() {
    this.position = new Vector(100, 100);
  }

  render() {
    const { position } = this;

    paint.path({
      points: [new Vector(100, 100), new Vector(100, 50)],
      stroke: 'black',
      lineCap: 'round',
      lineWidth: 16
    });
  }
}

const player = new Player();

player.render();
