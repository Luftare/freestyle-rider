import {
  getShadowPosition,
  getAngledSnowColor,
  SHADOW_COLOR,
  SNOW_COLOR,
  SNOW_SHADOW_COLOR,
  metersToPixels
} from './Graphics';

module.exports = {
  renderKicker({ position, width, length, height }, slopeAngle, paint) {
    const slopeColor = getAngledSnowColor(slopeAngle);
    const kickerAngle = Math.atan(height / length);
    const kickerColor = getAngledSnowColor(slopeAngle - kickerAngle);
    const gradient = paint.ctx.createLinearGradient(0, length - 30, 0, length);
    gradient.addColorStop(0, kickerColor);
    gradient.addColorStop(1, slopeColor);

    paint.rect({
      position: position,
      anchor: { x: 0, y: 0 },
      width: width,
      height: length,
      fill: gradient
    });

    paint.rect({
      position: position,
      anchor: { x: 0, y: 0 },
      width: width,
      height: metersToPixels(0.1),
      fill: 'red'
    });
  },

  renderKickerShadow(kicker, paint) {
    const topRight = {
      x: kicker.position.x + kicker.width,
      y: kicker.position.y
    };
    const bottomRight = {
      x: kicker.position.x + kicker.width,
      y: kicker.position.y + kicker.length
    };

    const tip = getShadowPosition(topRight, kicker.height);
    paint.path({
      points: [topRight, tip, bottomRight],
      fill: SHADOW_COLOR
    });
  },

  getKickerHeightAt(kicker, position) {
    const yDistanceFromKickerStart =
      kicker.position.y + kicker.length - position.y;
    const relativeYAtKicker = yDistanceFromKickerStart / kicker.length;
    return relativeYAtKicker * kicker.height;
  },

  getKickerAngle(kicker) {
    return Math.atan(kicker.height / kicker.length);
  },

  pointAlignedWithKicker(kicker, point) {
    return (
      point.x > kicker.position.x && point.x < kicker.position.x + kicker.width
    );
  }
};
