import Vector from 'vector';

module.exports = {
  SHADOW_COLOR: 'grey',
  SNOW_COLOR: 'white',
  SNOW_SHADOW_COLOR: 'lightgrey',
  getShadowPosition({ x, y }, z) {
    return new Vector(x, y).addX(z).addY(z * 0.5);
  }
};
