import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength, getCurvedSlope } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(4), y: -metersToPixels(22) },
    width: metersToPixels(8),
    height: metersToPixels(1.5),
    length: metersToPixels(3),
  },
];

const rails = [];

const tables = [
  {
    position: { x: -metersToPixels(1.5), y: -metersToPixels(32) },
    width: metersToPixels(3),
    height: metersToPixels(3),
    length: metersToPixels(6),
  },
];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(36),
  },
  ...getCurvedSlope(25, 40, DEFAULT_SLOPE_ANGLE),
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
};
