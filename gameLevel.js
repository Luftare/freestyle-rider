import { metersToPixels, toRadians } from './Graphics';

const kickers = [
  {
    position: { x: -metersToPixels(2), y: -metersToPixels(22) },
    width: metersToPixels(4),
    height: metersToPixels(2),
    length: metersToPixels(4)
  },
  {
    position: { x: -metersToPixels(2), y: -metersToPixels(68) },
    width: metersToPixels(4),
    height: metersToPixels(1),
    length: metersToPixels(4)
  }
];

const rails = [
  {
    position: { x: 0, y: -metersToPixels(85) },
    height: metersToPixels(1),
    length: metersToPixels(15)
  }
];

const slopes = [
  {
    angle: toRadians(15),
    length: metersToPixels(28)
  },
  {
    angle: toRadians(30),
    length: metersToPixels(15)
  },
  {
    angle: toRadians(15),
    length: metersToPixels(20)
  },
  {
    angle: toRadians(5),
    length: metersToPixels(22)
  },
  {
    angle: toRadians(25),
    length: metersToPixels(20)
  }
];

module.exports = {
  kickers,
  slopes,
  rails
};
