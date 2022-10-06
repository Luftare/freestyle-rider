import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength, getCurvedSlope } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(20) },
    width: metersToPixels(6),
    height: metersToPixels(1),
    length: metersToPixels(3),
  },
];

const rails = [];

const tables = [
  {
    position: { x: -metersToPixels(1.5), y: -metersToPixels(15 + 16) },
    width: metersToPixels(3),
    height: metersToPixels(1.5),
    length: metersToPixels(8),
  },
];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(35),
  },
  ...getCurvedSlope(12, 40, DEFAULT_SLOPE_ANGLE),
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
