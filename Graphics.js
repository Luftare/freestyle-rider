import Vector from 'vector';

let renderScale = 40;

module.exports = {
  SHADOW_COLOR: 'grey',
  SNOW_COLOR: 'white',
  SNOW_SHADOW_COLOR: 'lightgrey',
  getShadowPosition({ x, y }, z) {
    return new Vector(x, y).addX(z * 0.5).addY(z * 0.15);
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
