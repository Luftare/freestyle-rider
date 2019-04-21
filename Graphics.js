import Vector from 'vector';
import boardAndLegsSrc from './assets/images/board-and-legs.png';
import torsoSrc from './assets/images/torso.png';
import headSrc from './assets/images/head.png';

function createSprite(src) {
  const img = new Image();
  img.src = src;
  return img;
}

let renderScale = 40;

const graphics = {
  sunRayAngles: new Vector(0.9, 0.1),
  SHADOW_COLOR: 'grey',
  SNOW_COLOR: 'white',
  SNOW_SHADOW_COLOR: 'lightgrey',
  sprites: {
    boardAndLegs: createSprite(boardAndLegsSrc),
    torso: createSprite(torsoSrc),
    head: createSprite(headSrc)
  },
  getShadowPosition({ x, y }, z) {
    return new Vector(x, y)
      .addX(z * Math.sin(graphics.sunRayAngles.x))
      .addY(z * Math.sin(graphics.sunRayAngles.y));
  },
  getAngledSnowColor(angle) {
    const colorCode = Math.min(255, 220 * (1 - angle / Math.PI));
    return `rgb(${colorCode}, ${colorCode}, ${Math.min(255, colorCode + 5)})`;
  },
  metersToPixels(meters) {
    return meters * renderScale;
  },
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
};

module.exports = graphics;
