import basicRail from "./basic-rail";
import basicTable from "./basic-table";
import bigKicker from "./big-kicker";
import flatTable from "./flat-table";
import kickerHighTable from "./kicker-high-table";
import kickerKinkRail from "./kicker-kink-rail";
import kickerRailTable from "./kicker-rail-table";
import mediumKicker from "./medium-kicker";
import smallDrop from "./small-drop";

import { getTotalSlopeLength } from "../Slope";

export const levelFragments = [
  basicRail,
  basicTable,
  bigKicker,
  flatTable,
  kickerHighTable,
  kickerKinkRail,
  kickerRailTable,
  mediumKicker,
  smallDrop,
];

export const mergeLevels = (levels) => {
  let res = {
    start: {
      x: 0,
      y: 0,
    },
    end: {
      x: 0,
      y: 0,
    },
    kickers: [],
    slopes: [],
    rails: [],
    tables: [],
  };

  levels.forEach((level) => {
    const offset = getTotalSlopeLength(res.slopes);

    res.slopes = [...res.slopes, ...level.slopes];

    res.kickers = [
      ...res.kickers,
      ...level.kickers.map((k) => ({
        ...k,
        position: {
          ...k.position,
          y: k.position.y - offset,
        },
      })),
    ];

    res.rails = [
      ...res.rails,
      ...level.rails.map((k) => ({
        ...k,
        position: {
          ...k.position,
          y: k.position.y - offset,
        },
      })),
    ];

    res.tables = [
      ...res.tables,
      ...level.tables.map((k) => ({
        ...k,
        position: {
          ...k.position,
          y: k.position.y - offset,
        },
      })),
    ];
  });

  res.end.y = -getTotalSlopeLength(res.slopes);

  return res;
};
