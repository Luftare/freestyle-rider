import { getShadowPosition, SHADOW_COLOR, metersToPixels } from './Graphics';
import Vector from 'vector';

const railWidth = metersToPixels(0.15);

module.exports = {
  renderRail(rail, paint) {
    paint.rect({
      position: rail.position,
      height: rail.length,
      width: railWidth,
      fill: 'black',
      anchor: new Vector(0.5, 0)
    });
  },

  renderRailShadow(rail, paint) {
    const polePositions = [
      new Vector(rail.position).addY(0.1 * rail.length),
      new Vector(rail.position).addY(0.9 * rail.length)
    ];

    paint.path({
      points: [
        polePositions[0],
        getShadowPosition(polePositions[0], rail.height)
      ],
      lineWidth: railWidth,
      stroke: SHADOW_COLOR
    });

    paint.path({
      points: [
        polePositions[1],
        getShadowPosition(polePositions[1], rail.height)
      ],
      lineWidth: railWidth,
      stroke: SHADOW_COLOR
    });

    paint.rect({
      position: getShadowPosition(rail.position, rail.height),
      height: rail.length,
      width: railWidth,
      fill: SHADOW_COLOR,
      anchor: new Vector(0.5, 0)
    });
  },

  isRailBetweenPoints(rail, a, b, margin) {
    const providedLeft = a.x < b.x ? a : b;
    const providedRight = providedLeft === a ? b : a;

    const leftPoint = { x: providedLeft.x - margin * 0.5, y: providedLeft.y };
    const rightPoint = {
      x: providedRight.x + margin * 0.5,
      y: providedRight.y
    };

    const railBetweenPointsInX =
      leftPoint.x < rail.position.x && rightPoint.x > rail.position.x;

    if (!railBetweenPointsInX) return false;

    const deltaY = rightPoint.y - leftPoint.y;
    const railDistanceFromLeftPoint = rail.position.x - leftPoint.x;
    const pointsDistanceX = rightPoint.x - leftPoint.x;

    const pointsLineYAtRail =
      leftPoint.y + (railDistanceFromLeftPoint / pointsDistanceX) * deltaY;
    const pointsSegmentOverlappingRailY =
      pointsLineYAtRail > rail.position.y &&
      pointsLineYAtRail < rail.position.y + rail.length;

    return pointsSegmentOverlappingRailY;
  }
};
