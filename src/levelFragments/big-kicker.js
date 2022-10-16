import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength, getCurvedSlope } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(5), y: -metersToPixels(55) },
    width: metersToPixels(10),
    height: metersToPixels(3),
    length: metersToPixels(6),
  },
];

const rails = [];

const tables = [];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(10),
  },
  {
    angle: toRadians(35),
    length: metersToPixels(35),
  },
  {
    angle: toRadians(25),
    length: metersToPixels(25),
  },
  ...getCurvedSlope(40, 50, DEFAULT_SLOPE_ANGLE),
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
