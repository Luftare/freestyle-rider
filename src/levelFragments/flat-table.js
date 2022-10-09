import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength, getCurvedSlope } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [];

const rails = [];

const tables = [
  {
    position: { x: -metersToPixels(1.5), y: -metersToPixels(26) },
    width: metersToPixels(3),
    height: metersToPixels(0.2),
    length: metersToPixels(8),
  },
];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(27),
  },
  ...getCurvedSlope(15, DEFAULT_SLOPE_ANGLE + 15, DEFAULT_SLOPE_ANGLE),
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
