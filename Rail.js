import { getShadowPosition, SHADOW_COLOR } from './Graphics';

module.exports = {
  renderRail(rail, paint) {
    paint.rect({
      position: rail.position,
      height: rail.length,
      width: 6,
      fill: 'black',
      anchor: { x: 0.5, y: 0 }
    });
  },

  renderRailShadow(rail, paint) {
    paint.rect({
      position: getShadowPosition(rail.position, rail.height),
      height: rail.length,
      width: 6,
      fill: SHADOW_COLOR,
      anchor: { x: 0.5, y: 0 }
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
