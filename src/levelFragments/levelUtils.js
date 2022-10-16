import Vector from "vector";
import { TREE_FREE_WIDTH_METERS } from "./consts";
import { metersToPixels } from "../Graphics";
import { TREE_RADIUS } from "../Tree";

export const generateSideTrees = (canvasWidth, canvasHeight, slopeLength) => {
  const mapArea = canvasWidth * slopeLength;
  const treeDensity = 0.0001;
  const treeCount = Math.floor(mapArea * treeDensity);
  const randomTrees = [...Array(treeCount)].map(() => ({
    position: {
      x: Math.random() * canvasWidth - canvasWidth * 0.5,
      y: -(Math.random() * (slopeLength + canvasHeight * 2)) + canvasHeight,
    },
  }));

  const sideTrees = spreadEntities(randomTrees, TREE_RADIUS * 3, 5).filter(
    (t) => Math.abs(t.position.x) > metersToPixels(TREE_FREE_WIDTH_METERS * 0.5)
  );

  return sideTrees;
};

export const spreadEntities = (entities, minDistance, iterations) => {
  [...Array(iterations)].forEach(() => {
    entities.forEach((e) => {
      const otherEntities = entities.filter((o) => o !== e);
      const { closest, distance } = findClosest(e.position, otherEntities);

      if (closest && distance < minDistance) {
        const movement = new Vector(e.position)
          .subtract(closest.position)
          .toLength(minDistance * 0.33);
        e.position = new Vector(e.position).add(movement);
      }
    });
  });
  return entities;
};

const findClosest = (position, entities) => {
  let closestDistanceSq = Infinity;
  let res = null;

  entities.forEach((e) => {
    const distanceSq =
      (e.position.x - position.x) ** 2 + (e.position.y - position.y) ** 2;
    if (distanceSq < closestDistanceSq) {
      res = e;
      closestDistanceSq = distanceSq;
    }
  });

  return { closest: res, distance: closestDistanceSq ** 0.5 };
};
