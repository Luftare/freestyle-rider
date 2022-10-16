import { metersToPixels, toRadians } from "../Graphics";
import { getTotalSlopeLength } from "../Slope";
import { DEFAULT_SLOPE_ANGLE } from "./consts";

const kickers = [
  {
    position: { x: -metersToPixels(6), y: -metersToPixels(25) },
    width: metersToPixels(6.5),
    height: metersToPixels(0.5),
    length: metersToPixels(4),
  },
  {
    position: { x: metersToPixels(0.5), y: -metersToPixels(23) },
    width: metersToPixels(5.5),
    height: metersToPixels(1),
    length: metersToPixels(4),
  },
];

const rails = [];

const tables = [];

const slopes = [
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(32),
  },
  {
    angle: toRadians(35),
    length: metersToPixels(15),
  },
  {
    angle: toRadians(DEFAULT_SLOPE_ANGLE),
    length: metersToPixels(20),
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
