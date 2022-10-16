import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(20) },
    width: metersToPixels(6),
    height: metersToPixels(1.5),
    length: metersToPixels(6),
  },
];

const rails = [];

const tables = [
  {
    position: { x: -metersToPixels(1.5), y: -metersToPixels(30) },
    width: metersToPixels(3),
    height: metersToPixels(2),
    length: metersToPixels(8),
  },
  {
    position: { x: -metersToPixels(1.5), y: -metersToPixels(40) },
    width: metersToPixels(3),
    height: metersToPixels(1),
    length: metersToPixels(8),
  },
  {
    position: { x: -metersToPixels(1.5), y: -metersToPixels(50) },
    width: metersToPixels(3),
    height: metersToPixels(0.2),
    length: metersToPixels(8),
  },
];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(60),
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
