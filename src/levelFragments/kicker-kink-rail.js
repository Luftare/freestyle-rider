import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(20) },
    width: metersToPixels(6),
    height: metersToPixels(0.7),
    length: metersToPixels(3),
  },
];

const rails = [
  {
    position: { x: 0, y: -metersToPixels(15 + 25) },
    height: metersToPixels(1),
    length: metersToPixels(18),
  },
];

const tables = [];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(28),
  },
  {
    angle: toRadians(30),
    length: metersToPixels(20),
  },
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(10),
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
