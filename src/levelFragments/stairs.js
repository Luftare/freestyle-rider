import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: metersToPixels(2), y: -metersToPixels(18) },
    width: metersToPixels(2),
    height: metersToPixels(0.4),
    length: metersToPixels(2),
  },
];

const rails = [
  {
    position: { x: metersToPixels(3), y: -metersToPixels(30) },
    height: metersToPixels(1),
    length: metersToPixels(10),
  },
];

const tables = [...Array(10)].map((_, i) => ({
  position: { x: -metersToPixels(1.8), y: -metersToPixels(21.2 + i) },
  width: metersToPixels(4),
  height: metersToPixels(0.2 - i * 0.01),
  length: metersToPixels(0.8),
}));

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(20),
  },
  {
    angle: toRadians(30),
    length: metersToPixels(10),
  },
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(5),
  },
];

module.exports = {
  start: {
    x: 0,
    y: 0,
  },
  end: {
    x: 0,
    y: -getTotalSlopeLength(slopes),
  },
  kickers,
  slopes,
  rails,
  tables,
  trees: [],
};
