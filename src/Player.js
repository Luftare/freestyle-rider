import Vector from 'vector';
import SnowParticle from './SnowParticle';
import SparkParticle from './SparkParticle';
import {
  getKickerHeightAt,
  getKickerAngle,
  pointAlignedWithKicker,
} from './Kicker';
import { isRailBetweenPoints } from './Rail';
import { pointOnTable } from './Table';
import { getSlopeAt } from './Slope';
import {
  getShadowPosition,
  SHADOW_COLOR,
  metersToPixels,
  pixelsToMeters,
  mass,
  sprites,
  renderScale,
} from './Graphics';
import gameLevel from './gameLevel';
import audio from './audio';

const DEBUG_GRAPHICS = false;

const gravity = metersToPixels(-9.81);

export default class Player {
  constructor() {
    this.scale = 0.9;
    this.position = new Vector(gameLevel.start);
    this.previousPosition = this.position.clone();
    this.positionZ = 0;
    this.previousPositionZ = 0;
    this.velocity = new Vector(0, metersToPixels(-7));
    this.velocityZ = 0;
    this.moment = 1;
    this.angularVelocity = 0;
    this.boardDirection = new Vector(0, -1);
    this.boardLength = metersToPixels(1.6) * this.scale;
    this.boardWidth = metersToPixels(0.4) * this.scale;
    this.bodyRotationVelocity = 3;
    this.bodyAngle = 0;
    this.lastBoardDirection = this.boardDirection.clone();
    this.maxBodyAngle = Math.PI * 0.7;
    this.weight = mass(80);
    this.forces = [];
  }

  getAngularDelta() {
    return this.lastBoardDirection.angleBetweenSigned(this.boardDirection);
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

  update(dt, gameContext) {
    this.handleInput(dt, gameContext);
    this.applyPhysics(dt, gameContext);
    this.handleKickers();
    this.handleRails();
    this.handleTables();
    this.emitParticles(dt, gameContext);
    this.handleSlopeBoundaries();

    this.lastBoardDirection.set(this.boardDirection);
    this.previousPositionZ = this.positionZ;
  }

  applyPhysics(dt, gameContext) {
    this.applyMomentum(dt);
    this.applyGravity(dt);
    this.applySlopePhysics(dt, gameContext);
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

  getTableAt(position, positionZ) {
    const testPoints = [...this.getBoardTipPositions(position), position];

    return gameLevel.tables.find(table =>
      testPoints.find(
        point => pointOnTable(point, table) && table.height >= positionZ
      )
    );
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

  isOnTable() {
    return this.getTableAt(this.position, this.positionZ);
  }

  handleInput(dt, { input }) {
    this.handleTurning(dt, input);

    const spaceKey = input.keysDownOnce[' '];
    const shouldJump =
      spaceKey && (this.isGrounded() || this.isOnRail() || this.isOnTable());

    if (shouldJump) {
      this.jump();
    }
  }

  handleTurning(dt, input) {
    if (this.isGrounded()) {
      this.handleTurningOnGround(dt, input);
    } else {
      this.handleTurningInAir(dt, input);
    }
  }

  handleTurningOnGround(dt, input) {
    const { ArrowLeft, ArrowRight } = input.keysDown;

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

  handleTurningInAir(dt, input) {
    const { ArrowLeft, ArrowRight } = input.keysDown;
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
      const angleDelta = this.getAngularDelta();

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
    const maxAngularVelocity = 0.3;
    this.angularVelocity = Math.max(
      -maxAngularVelocity,
      Math.min(maxAngularVelocity, this.angularVelocity)
    );
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

  applySlopePhysics(dt, gameContext) {
    const currentSlope = getSlopeAt(this.position, gameLevel.slopes);
    const previousSlope = getSlopeAt(this.previousPosition, gameLevel.slopes);
    const didLandFromFlight = this.positionZ <= 0 && this.previousPositionZ > 0;

    if (didLandFromFlight) {
      const landingImpactFactor =
        this.getEdgeForce().length * 0.003 + Math.abs(this.velocityZ) * 0.005;
      const boardHitGroundNoiseVolume = Math.min(1, landingImpactFactor * 0.1);
      audio.play('snowLanding');
      audio.setVolume('snowLanding', boardHitGroundNoiseVolume);
      gameContext.fx.shake(landingImpactFactor);
    }

    const enteredNewSlope = currentSlope !== previousSlope;

    if (enteredNewSlope) {
      const newSlopeSteeper = currentSlope.angle > previousSlope.angle;

      const originalVelocity = this.velocity.length;
      const slopeAngleDelta = currentSlope.angle - previousSlope.angle;
      this.velocityZ += Math.sin(slopeAngleDelta) * originalVelocity;
      this.velocity.scale(Math.cos(slopeAngleDelta));

      if (newSlopeSteeper) {
        if (this.isGrounded()) {
          this.angularVelocity = this.getAngularDelta() * 0.5;
        }

        this.positionZ += metersToPixels(0.01);
      }
    }

    if (!this.isGrounded()) {
      audio.setVolume('snow', 0);
      return;
    }
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
    const onGround = this.isGrounded();
    const onRail = this.getRailAt(this.position);
    const onTable = this.getTableAt(this.position);
    if (onRail || onTable || !onGround) return;

    const edgeForce = this.getEdgeForce();

    this.forces.push(edgeForce);

    const snowVolume = Math.max(0.05, Math.min(1, edgeForce.length / 400));
    const normalizedSnowVolume = snowVolume ** 0.9 * 1;
    audio.setVolume('snow', normalizedSnowVolume);
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
    const airFrictionFactor = 0.0000015;
    const forceMagnitude = -airFrictionFactor * this.velocity.length ** 2;
    const force = this.velocity.clone().scale(forceMagnitude);
    this.forces.push(force);

    if (audio.sprites) {
      const totalVelocity = Math.sqrt(
        this.velocity.length ** 2 + this.velocityZ ** 2
      );
      const normalizedVelocity = Math.min(1, totalVelocity / 1500);
      audio.sprites.rate(normalizedVelocity, audio.playbackIds['wind']);
      audio.setVolume('wind', normalizedVelocity * 0.3);
    }
  }

  handleSlopeBoundaries() {
    this.handleSlopeSideBoundaries();
    this.handleEndOfSlope();
  }

  handleSlopeSideBoundaries() {
    const slopeWidth = window.innerWidth - metersToPixels(2);
    const minX = -slopeWidth / 2;
    const maxX = slopeWidth / 2;

    if (this.position.x < minX) {
      this.position.x = minX;
      this.velocity.x = Math.abs(this.velocity.x) * 0.5;
    }

    if (this.position.x > maxX) {
      this.position.x = maxX;
      this.velocity.x = -Math.abs(this.velocity.x) * 0.5;
    }
  }

  handleEndOfSlope() {
    if (this.position.y < gameLevel.end.y) {
      this.position.y = gameLevel.start.y;
    }
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
      this.angularVelocity = this.getAngularDelta() * 0.5;
    }
  }

  handleRails() {
    const previousRail = this.getRailAt(
      this.previousPosition,
      this.previousPositionZ
    );
    const currentRail = this.getRailAt(this.position, this.positionZ);

    const enteredRail = !previousRail && currentRail;

    if (enteredRail) {
      audio.stop('rail');
      audio.play('rail');
      audio.setVolume('rail', 0.2);
    }

    if (!currentRail && !previousRail) {
      audio.stop('rail');
    }

    if (currentRail) {
      const shouldTouchRail =
        this.positionZ - currentRail.height < metersToPixels(0.0);

      if (shouldTouchRail) {
        this.velocityZ = 0;
        this.positionZ = currentRail.height;
      }
    }
  }

  handleTables() {
    const currentTable = this.getTableAt(this.position, this.positionZ);

    const previousTable = this.getTableAt(
      this.previousPosition,
      this.previousPositionZ
    );

    const enteredTable = currentTable && !previousTable;

    if (enteredTable) {
      audio.stop('table');
      audio.play('table');
      audio.setVolume('table', 0.2);
    }

    if (!currentTable && !previousTable) {
      audio.stop('table');
    }

    if (currentTable) {
      this.velocityZ = 0;
      this.positionZ = currentTable.height;
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

  emitParticles(dt, gameContext) {
    const rail = this.getRailAt(this.position, this.positionZ);

    if (rail) {
      const position = new Vector(rail.position.x, this.position.y);
      const particleCount = 1;

      [...Array(particleCount)].forEach(() => {
        gameContext.particles.push(new SparkParticle(position));
      });

      return;
    }

    if (!this.isGrounded()) return;
    const [nose, tail] = this.getBoardTipPositions();

    const edgeForce = this.getEdgeForce();
    const particleCount = Math.floor(0.8 + edgeForce.length / 50);
    [...Array(particleCount)].forEach(() => {
      const toTail = nose
        .clone()
        .subtract(tail)
        .scale(Math.random());
      const position = tail.clone().add(toTail);
      gameContext.particles.push(new SnowParticle(position));
    });
  }

  render(paint) {
    this.renderBoard(paint);
    this.renderRider(paint);
  }

  renderShadow(paint) {
    paint.path({
      points: this.getBoardTipPositions().map(point =>
        getShadowPosition(point, this.positionZ)
      ),
      stroke: SHADOW_COLOR,
      lineCap: 'round',
      lineWidth: this.boardWidth,
    });
  }

  renderBoard(paint) {
    paint.image({
      image: sprites.boardAndLegs,
      scale: (this.scale * 0.33 * renderScale) / 40,
      angle: this.boardDirection.angle,
      position: this.position,
      anchor: { x: 0.5, y: 0.5 },
    });

    if (DEBUG_GRAPHICS) {
      paint.path({
        points: this.getBoardTipPositions(),
        stroke: 'lime',
        lineCap: 'round',
        lineWidth: this.boardWidth,
      });
    }
  }

  renderRider(paint) {
    paint.image({
      image: sprites.torso,
      scale: (this.scale * 0.33 * renderScale) / 40,
      angle: this.boardDirection.angle + this.bodyAngle,
      position: this.position,
      anchor: { x: 0.5, y: 0.5 },
    });

    const towardsDownHillAngle = this.boardDirection.y < 0 ? 0.8 : -0.8;

    const headAngle = this.isGrounded()
      ? this.boardDirection.angle + this.bodyAngle * 0.5 + towardsDownHillAngle
      : this.boardDirection.angle +
        this.bodyAngle * -0.5 +
        towardsDownHillAngle;

    paint.image({
      image: sprites.head,
      scale: (this.scale * 0.33 * renderScale) / 40,
      angle: headAngle,
      position: this.position,
      anchor: { x: 0.5, y: 0.5 },
    });

    if (DEBUG_GRAPHICS) {
      paint.rect({
        position: this.position,
        angle: this.bodyAngle + this.boardDirection.angle,
        anchor: new Vector(0.5, 0.5),
        width: metersToPixels(1.1),
        height: metersToPixels(0.3),
        fill: 'red',
      });
    }
  }
}
