import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(20) },
    width: metersToPixels(6),
    height: metersToPixels(0.5),
    length: metersToPixels(2.3),
  },
];

const rails = [
  {
    position: { x: 0, y: -metersToPixels(15 + 22) },
    height: metersToPixels(1),
    length: metersToPixels(15),
  },
];

const tables = [];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(45),
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
