import { getShadowPosition, SHADOW_COLOR } from './Graphics';
import Vector from 'vector';

module.exports = {
  renderTable(table, paint) {
    const gradient = paint.ctx.createLinearGradient(
      0,
      table.length - 30,
      table.width,
      table.length
    );
    gradient.addColorStop(0, 'sandybrown');
    gradient.addColorStop(1, 'saddlebrown');

    paint.rect({
      position: table.position,
      height: table.length,
      width: table.width,
      fill: gradient,
      anchor: new Vector(0, 0)
    });
  },

  renderTableShadow(table, paint) {
    paint.rect({
      position: getShadowPosition(table.position, table.height),
      height: table.length,
      width: table.width,
      fill: SHADOW_COLOR,
      anchor: new Vector(0, 0)
    });
  },

  pointOnTable(point, { position, width, length }) {
    return (
      point.x > position.x &&
      point.x < position.x + width &&
      point.y > position.y &&
      point.y < position.y + length
    );
  }
};
