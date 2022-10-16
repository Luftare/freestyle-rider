import Player from "./Player";
import Paint from "paint";
import Loop from "loop";
import Vector from "vector";
import Fx from "./Fx";
import { renderKicker, renderKickerShadow } from "./Kicker";
import { renderRail, renderRailShadow } from "./Rail";
import { renderTable, renderTableShadow } from "./Table";
import { renderSlopes, getSlopeAt } from "./Slope";
import { renderTreeShadow, renderTree } from "./Tree";
import { generateSideTrees } from "./levelFragments/levelUtils";

module.exports = class GameScene {
  constructor(config) {
    const { stance, gameLevel, input, canvas } = config;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.paint = new Paint(canvas);

    this.state = {
      gameLevel: this.preProcessGameLevel(gameLevel),
      player: new Player(config),
      fx: new Fx(canvas),
      particles: [],
      timeFactor: 1,
      input,
    };

    this.loop = new Loop({
      animationFrame: true,
      onTick: (dtInMs) => {
        const dtInSeconds = Math.min(
          0.1,
          (this.state.timeFactor * dtInMs) / 1000
        );
        this.update(dtInSeconds);
        this.render(dtInSeconds);
      },
    });
  }

  preProcessGameLevel(gameLevel) {
    gameLevel.trees = [
      ...gameLevel.trees,
      ...generateSideTrees(
        this.canvas.width,
        this.canvas.height,
        Math.abs(gameLevel.end.y)
      ),
    ];
    return gameLevel;
  }

  update(dt) {
    this.state.player.update(dt, this.state);
    this.state.particles.forEach((particle) => particle.update(dt));
    this.state.particles = this.state.particles.filter(
      (particle) => particle.life > 0
    );

    this.state.input.clearState();
  }

  render(dt) {
    this.canvas.width = this.canvas.width;
    this.state.fx.update(dt);
    const cameraY = this.state.player.position.y - this.canvas.height * 0.26;
    this.ctx.translate(
      this.canvas.width * 0.5,
      -cameraY + this.canvas.height * 0.5
    );

    renderSlopes(this.state.gameLevel.slopes, this.paint);

    this.paint.rect({
      position: new Vector(0, this.canvas.height / 2),
      width: this.canvas.width,
      height: 50,
      fill: "lightblue",
    });

    this.state.player.renderShadow(this.paint);
    this.state.gameLevel.kickers.forEach((kicker) =>
      renderKickerShadow(kicker, this.paint)
    );
    this.state.gameLevel.rails.forEach((rail) =>
      renderRailShadow(rail, this.paint)
    );
    this.state.gameLevel.tables.forEach((table) =>
      renderTableShadow(table, this.paint)
    );
    this.state.gameLevel.trees.forEach((tree) =>
      renderTreeShadow(tree, this.paint)
    );

    this.state.gameLevel.kickers.forEach((kicker) => {
      const slope = getSlopeAt(
        { y: kicker.position.y + kicker.length },
        this.state.gameLevel.slopes
      );
      renderKicker(kicker, slope.angle, this.paint);
    });
    this.state.gameLevel.rails.forEach((rail) => renderRail(rail, this.paint));
    this.state.gameLevel.tables.forEach((table) =>
      renderTable(table, this.paint)
    );
    this.state.particles.forEach((particle) => particle.render(this.paint));
    this.state.player.render(this.paint);
    this.state.gameLevel.trees.forEach((tree) =>
      renderTree(tree, cameraY, this.paint)
    );
  }
};
