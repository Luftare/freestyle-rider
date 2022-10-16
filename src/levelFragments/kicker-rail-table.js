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
    position: { x: 0, y: -metersToPixels(34) },
    height: metersToPixels(1),
    length: metersToPixels(11),
  },
];

const tables = [
  {
    position: { x: -metersToPixels(1), y: -metersToPixels(48) },
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
  {
    angle: toRadians(45),
    length: metersToPixels(0.5),
  },
  {
    angle: toRadians(35),
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
