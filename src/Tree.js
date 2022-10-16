import { getShadowPosition, SHADOW_COLOR, metersToPixels } from "./Graphics";
import Vector from "vector";

const TREE_RADIUS = metersToPixels(1.2);
const TREE_HEIGHT = metersToPixels(9);
const TREE_LAYERS_COUNT = 5;
const treeLayers = [...Array(TREE_LAYERS_COUNT)];
const treeOrigo = new Vector();
const treeTipShadowPoint = getShadowPosition(treeOrigo, TREE_HEIGHT);
const treeShadowPoints = [
  treeTipShadowPoint
    .clone()
    .rotate(-Math.PI * 0.5)
    .toLength(TREE_RADIUS),
  treeTipShadowPoint,
  treeTipShadowPoint
    .clone()
    .rotate(Math.PI * 0.5)
    .toLength(TREE_RADIUS),
];

module.exports = {
  TREE_RADIUS,
  renderTree(tree, cameraY, paint) {
    treeLayers.forEach((_, layerIndex) => {
      const layerHeight = (layerIndex / TREE_LAYERS_COUNT) * TREE_HEIGHT;
      const dX = tree.position.x;
      const dY = tree.position.y - cameraY;
      const offset = {
        x: dX * 0.0005 * layerHeight,
        y: dY * 0.0005 * layerHeight,
      };
      const radius =
        (TREE_RADIUS * (TREE_LAYERS_COUNT - layerIndex)) / TREE_LAYERS_COUNT;

      paint.circle({
        position: {
          x: tree.position.x + offset.x,
          y: tree.position.y + offset.y,
        },
        fill: layerIndex % 2 === 0 ? "green" : "darkgreen",
        radius,
      });
    });
  },

  renderTreeShadow(tree, paint) {
    paint.setViewOffset(-tree.position.x, -tree.position.y);
    paint.path({
      points: treeShadowPoints,
      fill: SHADOW_COLOR,
    });
    paint.setViewOffset(0, 0);
  },

  playerCollidesTree(player, tree) {
    return (
      (player.position.x - tree.position.x) ** 2 +
        (player.position.y - tree.position.y) ** 2 <
      TREE_RADIUS ** 2
    );
  },
};
