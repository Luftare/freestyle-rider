import Vector from 'vector';
import boardAndLegsSrc from '../assets/images/board-and-legs.png';
import torsoSrc from '../assets/images/torso.png';
import headSrc from '../assets/images/head.png';

function createSprite(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function isTouchDevice() {
  return 'ontouchstart' in window;
}

let renderScale = 40;

const graphics = {
  sunRayAngles: new Vector(0.9, 0.1),
  SHADOW_COLOR: 'grey',
  SNOW_COLOR: 'white',
  SNOW_SHADOW_COLOR: 'lightgrey',
  isTouchDevice,
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
    const colorCode = Math.min(255, 230 * (1 - angle / Math.PI));
    const weightedColor = 255 * Math.pow(colorCode / 255, 0.7);
    return `rgb(${weightedColor}, ${weightedColor}, ${Math.min(255, weightedColor + 25)})`;
  },
  metersToPixels(meters) {
    return meters * renderScale;
  },
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
};

module.exports = graphics;
