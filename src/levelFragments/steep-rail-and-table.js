import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(5), y: -metersToPixels(28) },
    width: metersToPixels(10),
    height: metersToPixels(0.5),
    length: metersToPixels(4),
  },
];

const rails = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(46) },
    height: metersToPixels(1),
    length: metersToPixels(12),
  },
];

const tables = [
  {
    position: { x: metersToPixels(1), y: -metersToPixels(44) },
    width: metersToPixels(3),
    height: metersToPixels(0.4),
    length: metersToPixels(8),
  },
];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(32),
  },
  {
    angle: toRadians(35),
    length: metersToPixels(20),
  },
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(20),
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
