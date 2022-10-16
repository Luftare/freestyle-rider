import basicRail from "./basic-rail";
import basicTable from "./basic-table";
import bigKicker from "./big-kicker";
import flatTable from "./flat-table";
import kickerHighTable from "./kicker-high-table";
import kickerKinkRail from "./kicker-kink-rail";
import kickerRailTable from "./kicker-rail-table";
import mediumKicker from "./medium-kicker";
import smallDrop from "./small-drop";
import steepRailAndTable from "./steep-rail-and-table";
import steppedTables from "./stepped-tables";
import flatKicker from "./flat-kicker";
import miniKicker from "./mini-kicker";
import stairs from "./stairs";

import { getTotalSlopeLength } from "../Slope";

export const levelFragments = [
  {
    name: "Basic Rail",
    level: basicRail,
  },
  {
    name: "Basic Table",
    level: basicTable,
  },
  {
    name: "Stairs",
    level: stairs,
  },
  {
    name: "Big Kicker",
    level: bigKicker,
  },
  {
    name: "Mini Kicker",
    level: miniKicker,
  },
  {
    name: "Flat Table",
    level: flatTable,
  },
  {
    name: "Flat Kicker",
    level: flatKicker,
  },
  {
    name: "Steep Rail & Table",
    level: steepRailAndTable,
  },
  {
    name: "Kicker & High Table",
    level: kickerHighTable,
  },
  {
    name: "Kicker & Kink Rail",
    level: kickerKinkRail,
  },
  {
    name: "Kicker-Rail-Table Combo",
    level: kickerRailTable,
  },
  {
    name: "Medius Kicker",
    level: mediumKicker,
  },
  {
    name: "Stepped Tables",
    level: steppedTables,
  },
  {
    name: "Small Drop",
    level: smallDrop,
  },
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
    trees: [],
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

    res.trees = [
      ...res.trees,
      ...level.trees.map((k) => ({
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
