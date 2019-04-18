import Vector from 'vector';
import Paint from 'paint';
import Loop from 'loop';
import SnowParticle from './SnowParticle';
import GameInput from './GameInput';
import {
  renderKicker,
  renderKickerShadow,
  getKickerHeightAt,
  getKickerAngle,
  pointAlignedWithKicker
} from './Kicker';
import { renderRail, renderRailShadow, isRailBetweenPoints } from './Rail';
import { renderSlopes, getTotalSlopeLength, getSlopeAt } from './Slope';
import { getShadowPosition, SHADOW_COLOR, metersToPixels } from './Graphics';
import gameLevel from './gameLevel';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const paint = new Paint(canvas);
const gameInput = new GameInput(canvas);
const gravity = metersToPixels(-9.81);
let particles = [];

class Player {
  constructor() {
    this.position = new Vector(0, 0);
    this.previousPosition = this.position.clone();
    this.positionZ = 0;
    this.velocity = new Vector(0, -100);
    this.velocityZ = 0;
    this.moment = 1;
    this.angularVelocity = 0;
    this.boardDirection = new Vector(0, -1);
    this.boardLength = metersToPixels(1.6);
    this.boardWidth = metersToPixels(0.4);
    this.bodyRotationVelocity = 3;
    this.bodyAngle = 0;
    this.lastBoardAngle = this.boardDirection.angle;
    this.maxBodyAngle = Math.PI * 0.4;
    this.weight = 1;
    this.forces = [];
  }

  isGrounded() {
    return this.positionZ <= 0;
  }

  getBoardTipPositions(position = this.position) {
    const halfLength = this.boardLength * 0.5;
    const centerToNose = this.boardDirection.clone().toLength(halfLength);
    const centerToTail = centerToNose.clone().mirror();

    const nosePosition = position.clone().add(centerToNose);
    const tailPosition = position.clone().add(centerToTail);

    return [nosePosition, tailPosition];
  }

  update(dt) {
    this.handleInput(dt);
    this.applyPhysics(dt);
    this.handleKickers();
    this.handleRails();
    this.emitParticles(dt);
    const slopeLength = getTotalSlopeLength(gameLevel.slopes);
    if (this.position.y < -slopeLength) this.position.y = 0;
    this.lastBoardAngle = this.boardDirection.angle;
  }

  applyPhysics(dt) {
    this.applyMomentum(dt);
    this.applyGravity(dt);
    this.applySlopePhysics(dt);
    this.applyBoardPhysics(dt);
    this.applyAirFriction(dt);
    this.applyForces(dt);
  }

  getKickerAt({ x, y }, z) {
    return gameLevel.kickers.find(kicker => {
      const { position, width, length } = kicker;
      return (
        x > position.x &&
        x < position.x + width &&
        y > position.y &&
        y < position.y + length &&
        getKickerHeightAt(kicker, { x, y }) > z
      );
    });
  }

  getRailAt(position, positionZ) {
    const [nose, tail] = this.getBoardTipPositions(position);
    return gameLevel.rails.find(
      rail =>
        rail.height >= positionZ &&
        isRailBetweenPoints(rail, nose, tail, this.boardWidth)
    );
  }

  isOnRail() {
    return this.getRailAt(this.position, this.positionZ);
  }

  handleInput(dt) {
    this.handleTurning(dt);

    const spaceKey = gameInput.keysDownOnce[' '];
    const shouldJump = spaceKey && (this.isGrounded() || this.isOnRail());

    if (shouldJump) {
      this.jump();
    }
  }

  handleTurning(dt) {
    if (this.isGrounded()) {
      this.handleTurningOnGround(dt);
    } else {
      this.handleTurningInAir(dt);
    }
  }

  handleTurningOnGround(dt) {
    const { ArrowLeft, ArrowRight } = gameInput.keysDown;

    const shouldRotateBoard = ArrowRight || ArrowLeft;

    if (ArrowLeft) {
      this.bodyAngle -= this.bodyRotationVelocity * dt;
    }

    if (ArrowRight) {
      this.bodyAngle += this.bodyRotationVelocity * dt;
    }

    this.bodyAngle = Math.max(
      -this.maxBodyAngle,
      Math.min(this.maxBodyAngle, this.bodyAngle)
    );

    if (shouldRotateBoard) {
      if (
        (ArrowLeft && this.angularVelocity > 0) ||
        (ArrowRight && this.angularVelocity < 0)
      ) {
        this.angularVelocity *= 0.9;
      }

      const boardRotateAngle = this.bodyRotationVelocity * this.bodyAngle * dt;
      this.boardDirection.rotate(boardRotateAngle);
    } else {
      this.bodyAngle *= 0.85;
    }
  }

  handleTurningInAir(dt) {
    const { ArrowLeft, ArrowRight } = gameInput.keysDown;
    const boardBodyRotateRatio = 0.8;

    if (ArrowRight) {
      this.bodyAngle -= this.bodyRotationVelocity * dt;
    }

    if (ArrowLeft) {
      this.bodyAngle += this.bodyRotationVelocity * dt;
    }

    this.bodyAngle = Math.max(
      -this.maxBodyAngle,
      Math.min(this.maxBodyAngle, this.bodyAngle)
    );

    const bodyCanTurn = Math.abs(this.bodyAngle) < this.maxBodyAngle;

    if (bodyCanTurn) {
      if (ArrowLeft) {
        this.boardDirection.rotate(
          -this.bodyRotationVelocity * boardBodyRotateRatio * dt
        );
      }

      if (ArrowRight) {
        this.boardDirection.rotate(
          this.bodyRotationVelocity * boardBodyRotateRatio * dt
        );
      }
    }

    const shouldStraightenBody = !ArrowLeft && !ArrowRight;

    if (shouldStraightenBody) {
      const shouldLerpAngle = Math.abs(this.bodyAngle) > 0.05;

      if (shouldLerpAngle) {
        const bodyAngleSign = this.bodyAngle < 0 ? -1 : 1;
        this.bodyAngle -= bodyAngleSign * this.bodyRotationVelocity * dt;
        this.boardDirection.rotate(
          bodyAngleSign * this.bodyRotationVelocity * boardBodyRotateRatio * dt
        );
      } else {
        this.bodyAngle = 0;
      }
    }
  }

  jump() {
    if (!this.isOnRail()) {
      const angleDelta = this.boardDirection.angle - this.lastBoardAngle;
      this.angularVelocity =
        Math.abs(angleDelta) > Math.abs(this.angularVelocity)
          ? angleDelta
          : this.angularVelocity;
    }

    this.velocityZ = metersToPixels(2);
    this.positionZ += metersToPixels(0.1);
    const kicker = this.getKickerAt(this.position, this.positionZ);

    if (kicker) {
      const heightAtKicker = getKickerHeightAt(kicker, this.position);
      const kickerAngle = getKickerAngle(kicker);
      const verticalVelocity = Math.sin(kickerAngle) * this.velocity.length;
      this.velocityZ += verticalVelocity;
      this.positionZ += heightAtKicker;
    }
  }

  applyMomentum() {
    if (this.isGrounded()) {
      this.angularVelocity *= 0.95;
    }

    this.boardDirection.rotate(this.angularVelocity);
  }

  applyGravity(dt) {
    const isFlying = this.positionZ > 0;

    if (isFlying) {
      const slopeAngle = getSlopeAt(this.position, gameLevel.slopes).angle;
      this.velocityZ += Math.cos(slopeAngle) * gravity * dt;
      this.positionZ += this.velocityZ * dt;
    } else {
      this.positionZ = 0;
      this.velocityZ = 0;
    }
  }

  applySlopePhysics() {
    const currentSlope = getSlopeAt(this.position, gameLevel.slopes);
    const previousSlope = getSlopeAt(this.previousPosition, gameLevel.slopes);

    const enteredNewSlope = currentSlope !== previousSlope;

    if (enteredNewSlope) {
      const newSlopeSteeper = currentSlope.angle > previousSlope.angle;

      const originalVelocity = this.velocity.length;
      const slopeAngleDelta = currentSlope.angle - previousSlope.angle;
      this.velocityZ += Math.sin(slopeAngleDelta) * originalVelocity;
      this.velocity.scale(Math.cos(slopeAngleDelta));

      if (newSlopeSteeper) {
        if (this.isGrounded()) {
          this.angularVelocity =
            (this.boardDirection.angle - this.lastBoardAngle) * 0.5;
        }

        this.positionZ += metersToPixels(0.01);
      }
    }

    if (!this.isGrounded()) return;
    const kicker = this.getKickerAt(this.position, this.positionZ);
    const kickerAngle = kicker ? getKickerAngle(kicker) : 0;

    const gravityForceMagnitude = gravity * this.weight;
    const slopeAngle = currentSlope.angle;
    const gravityForceSlopeComponent = new Vector(
      0,
      Math.sin(slopeAngle - kickerAngle) * gravityForceMagnitude
    );

    this.forces.push(gravityForceSlopeComponent);
  }

  applyBoardPhysics() {
    if (!this.isGrounded()) return;
    if (this.getRailAt(this.position)) return;

    const edgeForce = this.getEdgeForce();

    this.forces.push(edgeForce);
  }

  getEdgeForce() {
    const edgeFrictionFactor = 1.5;

    const edgeForceMagnitude =
      this.velocity.clone().cross(this.boardDirection) * edgeFrictionFactor;

    return this.boardDirection
      .clone()
      .rotate(Math.PI / 2)
      .scale(edgeForceMagnitude);
  }

  applyAirFriction() {
    const airFrictionFactor = 0.0000005;
    const forceMagnitude = -airFrictionFactor * this.velocity.length ** 2;
    const force = this.velocity.clone().scale(forceMagnitude);
    this.forces.push(force);
  }

  handleKickers() {
    const previousKicker = this.getKickerAt(
      this.previousPosition,
      this.positionZ
    );

    const currentKicker = this.getKickerAt(this.position, this.positionZ);

    const enteredKicker = !previousKicker && currentKicker;
    const collisionWithKickerSide =
      enteredKicker &&
      !pointAlignedWithKicker(currentKicker, this.previousPosition);

    if (collisionWithKickerSide) {
      this.position = this.previousPosition.clone();
      this.velocity.setX(-0.5 * this.velocity.x);
      return;
    }

    if (enteredKicker) {
      const kickerAngle = getKickerAngle(currentKicker);
      this.velocity.scale(Math.cos(kickerAngle));
    }

    const jumpedKicker = !currentKicker && previousKicker;
    if (jumpedKicker) {
      const kickerAngle = getKickerAngle(previousKicker);

      const slopeVelocity = this.velocity.length;
      this.velocity.toLength(Math.cos(kickerAngle) * slopeVelocity);
      this.positionZ = getKickerHeightAt(previousKicker, this.previousPosition);
      this.velocityZ = Math.sin(kickerAngle) * slopeVelocity;
      this.angularVelocity =
        (this.boardDirection.angle - this.lastBoardAngle) * 0.5;
    }
  }

  handleRails() {
    const previousRail = this.getRailAt(this.previousPosition, this.positionZ);
    const currentRail = this.getRailAt(this.position, this.positionZ);

    const enteredRail = !previousRail && currentRail;
    const collisionWithRailSide =
      enteredRail && this.positionZ < enteredRail.height;

    if (collisionWithRailSide) {
      this.position = this.previousPosition.clone();
      this.velocity.setX(-0.5 * this.velocity.x);
      return;
    }

    if (currentRail) {
      const shouldTouchRail =
        this.positionZ - currentRail.height < metersToPixels(0.0);

      if (shouldTouchRail) {
        this.velocityZ = 0;
        this.positionZ = currentRail.height;
        this.velocity.setX(0.98 * this.velocity.x);
      }
    }
  }

  applyForces(dt) {
    const totalForce = this.forces.reduce(
      (acc, force) => acc.add(force),
      new Vector()
    );

    this.previousPosition = this.position.clone();
    const acceleration = totalForce.scale(1 / this.weight);
    this.velocity.scaledAdd(dt, acceleration);
    this.position.scaledAdd(dt, this.velocity);
    this.forces = [];
  }

  emitParticles() {
    if (!this.isGrounded()) return;
    if (this.getRailAt(this.position, this.positionZ)) return;
    const [nose, tail] = this.getBoardTipPositions();

    const edgeForce = this.getEdgeForce();
    const particleCount = Math.floor(0.8 + edgeForce.length / 100);

    [...Array(particleCount)].forEach(() => {
      const toTail = nose
        .clone()
        .substract(tail)
        .scale(Math.random());
      const position = tail.clone().add(toTail);
      particles.push(new SnowParticle(position));
    });
  }

  render() {
    this.renderBoard();
    this.renderRider();
  }

  renderShadow() {
    paint.path({
      points: this.getBoardTipPositions().map(point =>
        getShadowPosition(point, this.positionZ)
      ),
      stroke: SHADOW_COLOR,
      lineCap: 'round',
      lineWidth: this.boardWidth
    });
  }

  renderBoard() {
    paint.path({
      points: this.getBoardTipPositions(),
      stroke: 'black',
      lineCap: 'round',
      lineWidth: this.boardWidth
    });
  }

  renderRider() {
    paint.rect({
      position: this.position,
      angle: this.bodyAngle + this.boardDirection.angle,
      anchor: new Vector(0.5, 0.5),
      width: metersToPixels(1.1),
      height: metersToPixels(0.3),
      fill: 'red'
    });
  }
}

const player = new Player();

function update(dt) {
  player.update(dt);
  particles.forEach(particle => particle.update(dt));
  particles = particles.filter(particle => particle.life > 0);
  gameInput.clearState();
}

function render() {
  canvas.width = canvas.width;
  ctx.translate(
    -player.position.x + canvas.width / 2,
    -player.position.y + canvas.height / 1.5
  );

  renderSlopes(gameLevel.slopes, paint);

  paint.rect({
    position: new Vector(0, canvas.height / 2),
    width: canvas.width,
    height: 50,
    fill: 'lightblue'
  });

  player.renderShadow();
  gameLevel.kickers.forEach(kicker => renderKickerShadow(kicker, paint));
  gameLevel.rails.forEach(rail => renderRailShadow(rail, paint));

  gameLevel.kickers.forEach(kicker => {
    const slope = getSlopeAt(
      { y: kicker.position.y + kicker.length },
      gameLevel.slopes
    );
    renderKicker(kicker, slope.angle, paint);
  });
  gameLevel.rails.forEach(rail => renderRail(rail, paint));
  particles.forEach(particle => particle.render(paint));
  player.render();
}

new Loop({
  animationFrame: true,
  autoStart: true,
  onTick: dtInMs => {
    const dtInSeconds = dtInMs / 1000;
    update(dtInSeconds);
    render();
  }
});
