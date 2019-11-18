import { metersToPixels, toRadians } from './Graphics';

const kickers = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(40) },
    width: metersToPixels(6),
    height: metersToPixels(2),
    length: metersToPixels(4),
  },
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(88) },
    width: metersToPixels(6),
    height: metersToPixels(0.6),
    length: metersToPixels(2.5),
  },
  {
    position: { x: -metersToPixels(4), y: -metersToPixels(135) },
    width: metersToPixels(8),
    height: metersToPixels(0.75),
    length: metersToPixels(3),
  },
];

const rails = [
  {
    position: { x: 0, y: -metersToPixels(110) },
    height: metersToPixels(1),
    length: metersToPixels(20),
  },
  {
    position: { x: metersToPixels(3), y: -metersToPixels(144) },
    height: metersToPixels(1.2),
    length: metersToPixels(7),
  },
];

const tables = [
  {
    position: { x: -metersToPixels(3), y: -metersToPixels(144) },
    width: metersToPixels(2),
    height: metersToPixels(1.5),
    length: metersToPixels(7),
  },
];

const slopes = [
  {
    angle: toRadians(15),
    length: metersToPixels(48),
  },
  ...[...Array(5)].map((_, i) => ({
    angle: toRadians(40 - i * 4),
    length: metersToPixels(3),
  })),
  {
    angle: toRadians(15),
    length: metersToPixels(20),
  },
  {
    angle: toRadians(5),
    length: metersToPixels(13.5),
  },
  {
    angle: toRadians(30),
    length: metersToPixels(18.5),
  },
  {
    angle: toRadians(20),
    length: metersToPixels(5),
  },
  {
    angle: toRadians(5),
    length: metersToPixels(26),
  },
  {
    angle: toRadians(30),
    length: metersToPixels(10),
  },
  {
    angle: toRadians(15),
    length: metersToPixels(50),
  },
];

module.exports = {
  start: {
    x: 0,
    y: -metersToPixels(20),
  },
  end: {
    x: 0,
    y: -metersToPixels(170),
  },
  kickers,
  slopes,
  rails,
  tables,
};
