import { metersToPixels, toRadians } from "./Graphics";
import { getTotalSlopeLength, getFlatteningCurve } from "./Slope";

const kickers = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(22) },
    width: metersToPixels(6),
    height: metersToPixels(2),
    length: metersToPixels(4),
  },
];

const rails = [];

const tables = [];

const slopes = [
  {
    angle: toRadians(15),
    length: metersToPixels(30),
  },
  ...getFlatteningCurve(metersToPixels(20), 45, 15),
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
