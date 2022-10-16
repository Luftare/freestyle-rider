import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength, getCurvedSlope } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(4), y: -metersToPixels(20) },
    width: metersToPixels(8),
    height: metersToPixels(0.8),
    length: metersToPixels(10),
  },
];

const rails = [];

const tables = [];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(20),
  },
  ...getCurvedSlope(20, DEFAULT_SLOPE_ANGLE, 70),
  ...getCurvedSlope(20, 70, DEFAULT_SLOPE_ANGLE),
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
