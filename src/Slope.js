import Vector from 'vector';
import { getAngledSnowColor, metersToPixels } from './Graphics';
import { SLOPE_WIDTH } from './config';

module.exports = {
  renderSlopes(slopes, paint) {
    const slopeAnchor = new Vector(0.5, 1);
    const offsetY = 2;
    let offset = 0;

    slopes.forEach((slope, i) => {
      const previousSlopeIndex = Math.max(0, i - 1);
      const previousSlope = slopes[previousSlopeIndex];
      const previousSlopeColor = getAngledSnowColor(previousSlope.angle);
      const currentSlopeColor = getAngledSnowColor(slope.angle);

      const gradient = paint.ctx.createLinearGradient(
        0,
        slope.length - metersToPixels(0.7) + offsetY,
        0,
        slope.length + offsetY
      );
      gradient.addColorStop(0, currentSlopeColor);
      gradient.addColorStop(1, previousSlopeColor);

      paint.rect({
        position: { x: 0, y: offset },
        width: SLOPE_WIDTH,
        height: slope.length + offsetY,
        anchor: slopeAnchor,
        fill: gradient
      });

      offset -= slope.length;
    });
  },
  getTotalSlopeLength(slopes) {
    return slopes.reduce((sum, slope) => sum + slope.length, 0);
  },
  getSlopeAt({ y }, slopes) {
    let totalDistance = 0;
    let currentSlope = slopes[0];

    slopes.forEach(slope => {
      if (totalDistance > y && totalDistance - slope.length < y) {
        currentSlope = slope;
      }

      totalDistance -= slope.length;
    });

    return currentSlope;
  }
};
