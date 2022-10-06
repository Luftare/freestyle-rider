import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [];

const rails = [];

const tables = [
  {
    position: { x: -metersToPixels(1), y: -metersToPixels(25) },
    width: metersToPixels(2),
    height: metersToPixels(0.3),
    length: metersToPixels(10),
  },
];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(35),
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
};
