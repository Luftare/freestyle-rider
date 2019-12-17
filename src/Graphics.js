import Vector from 'vector';
import boardAndLegsSrc from '../assets/images/board-and-legs.png';
import torsoSrc from '../assets/images/torso.png';
import headSrc from '../assets/images/head.png';

function createSprite(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const messagesContainer = document.getElementById('messages');
let messageTimeoutId = 0;

let renderScale = window.innerHeight / 25;

const graphics = {
  renderScale,
  sunRayAngles: new Vector(0.9, 0.3),
  SHADOW_COLOR: 'grey',
  SNOW_COLOR: 'white',
  SNOW_SHADOW_COLOR: 'lightgrey',
  sprites: {
    boardAndLegs: createSprite(boardAndLegsSrc),
    torso: createSprite(torsoSrc),
    head: createSprite(headSrc),
  },
  showMessage(text, color) {
    const element = document.createElement('div');
    element.classList = 'message';
    element.innerHTML = text;
    element.style.color = color;

    clearTimeout(messageTimeoutId);
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(element);

    messageTimeoutId = setTimeout(() => {
      messagesContainer.removeChild(element);
    }, 2000);
  },
  radToDeg(rad) {
    return (rad * 180) / Math.PI;
  },
  getShadowPosition({ x, y }, z) {
    return new Vector(x, y)
      .addX((z * Math.sin(graphics.sunRayAngles.x) * renderScale) / 40)
      .addY((z * Math.sin(graphics.sunRayAngles.y) * renderScale) / 40);
  },
  getAngledSnowColor(angle) {
    const intensity = Math.min(1, 1 - angle / Math.PI);
    const r = 255 * Math.pow(intensity, 0.6);
    const g = 255 * Math.pow(intensity, 0.6);
    const b = 255 * Math.pow(intensity, 0.3);
    return `rgb(${r}, ${g}, ${b})`;
  },
  metersToPixels(meters) {
    return meters * renderScale;
  },
  pixelsToMeters(pixels) {
    return pixels / renderScale;
  },
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },
  mass(kilograms) {
    return kilograms * 0.0005 * renderScale;
  },
};

module.exports = graphics;
