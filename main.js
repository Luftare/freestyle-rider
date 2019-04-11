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
import { getShadowPosition, SHADOW_COLOR } from './Graphics';

let renderScale = 40;

function metersToPixels(meters) {
  return meters * renderScale;
}

function pixelsToMeters(pixels) {
  return pixels / renderScale;
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const paint = new Paint(canvas);
const gameInput = new GameInput(canvas);
const slopeAngle = 20 * (Math.PI / 180);
const gravity = metersToPixels(-9.81);
let particles = [];

const kickers = [
  {
    position: { x: 220, y: 200 },
    width: metersToPixels(4),
    height: metersToPixels(1),
    length: metersToPixels(4)
  }
];

class Player {
  constructor() {
    this.position = new Vector(canvas.width / 2, 100);
    this.previousPosition = this.position.clone();
    this.positionZ = metersToPixels(2);
    this.velocity = new Vector(0, -100);
    this.velocityZ = 0;
    this.moment = 1;
    this.angularVelocity = 0;
    this.boardDirection = new Vector(0, -1);
    this.boardLength = metersToPixels(1.6);
    this.boardWidth = metersToPixels(0.4);
    this.bodyAngle = 0;
    this.lastBoardAngle = this.boardDirection.angle;
    this.maxBodyAngle = Math.PI * 0.4;
    this.weight = 1;
    this.forces = [];
  }

  isGrounded() {
    return this.positionZ <= 0;
  }

  getBoardTipPositions() {
    const halfLength = this.boardLength * 0.5;
    const centerToNose = this.boardDirection.clone().toLength(halfLength);
    const centerToTail = centerToNose.clone().mirror();

    const nosePosition = this.position.clone().add(centerToNose);
    const tailPosition = this.position.clone().add(centerToTail);

    return [nosePosition, tailPosition];
  }

  update(dt) {
    this.handleInput(dt);
    this.applyMomentum(dt);
    this.applyGravity(dt);
    this.applySlopePhysics(dt);
    this.applyBoardPhysics(dt);
    this.applyAirFriction(dt);
    this.applyForces(dt);
    this.handleKickers(dt);
    this.emitParticles(dt);
    if (this.position.y < 0) this.position.y = canvas.height;

    this.lastBoardAngle = this.boardDirection.angle;
  }

  getKickerAt({ x, y }, z) {
    return kickers.find(kicker => {
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

  handleInput(dt) {
    const { ArrowLeft, ArrowRight } = gameInput.keysDown;
    const spaceKey = gameInput.keysDownOnce[' '];
    const rotation = 3 * dt;
    const boardBodyRotateRatio = 0.8;

    if (ArrowLeft) {
      this.bodyAngle -= rotation;
    }

    if (ArrowRight) {
      this.bodyAngle += rotation;
    }

    this.bodyAngle = Math.max(
      -this.maxBodyAngle,
      Math.min(this.maxBodyAngle, this.bodyAngle)
    );

    const shouldRotateBoard = ArrowRight || ArrowLeft;

    if (this.isGrounded()) {
      if (shouldRotateBoard) {
        const boardRotateAngle = 3 * this.bodyAngle * dt;
        this.boardDirection.rotate(boardRotateAngle);
      } else {
        this.bodyAngle *= 0.85;
      }

      const shouldJump = spaceKey;

      if (shouldJump) {
        this.jump();
      }
    } else {
      const bodyCanTurn = Math.abs(this.bodyAngle) < this.maxBodyAngle;

      if (bodyCanTurn) {
        if (ArrowLeft) {
          this.boardDirection.rotate(rotation * boardBodyRotateRatio);
        }

        if (ArrowRight) {
          this.boardDirection.rotate(-rotation * boardBodyRotateRatio);
        }
      }

      const shouldStraightenBody = !ArrowLeft && !ArrowRight;

      if (shouldStraightenBody) {
        const shouldLerpAngle = Math.abs(this.bodyAngle) > 0.05;

        if (shouldLerpAngle) {
          const bodyAngleSign = this.bodyAngle < 0 ? -1 : 1;
          this.bodyAngle -= bodyAngleSign * rotation;
          this.boardDirection.rotate(
            bodyAngleSign * rotation * boardBodyRotateRatio
          );
        } else {
          this.bodyAngle = 0;
        }
      }
    }
  }

  jump() {
    this.angularVelocity = this.boardDirection.angle - this.lastBoardAngle;
    this.velocityZ = metersToPixels(4);
    this.positionZ += metersToPixels(0.5);
    const kicker = this.getKickerAt(this.position, this.positionZ);

    if (kicker) {
      const heightAtKicker = getKickerHeightAt(kicker, this.position);
      this.positionZ += heightAtKicker;
    }
  }

  applyMomentum() {
    if (this.isGrounded()) {
      this.angularVelocity *= 0.9;
    }

    this.boardDirection.rotate(this.angularVelocity);
  }

  applyGravity(dt) {
    const isFlying = this.positionZ > 0;

    if (isFlying) {
      this.velocityZ += Math.cos(slopeAngle) * gravity * dt;
      this.positionZ += this.velocityZ * dt;
    } else {
      this.positionZ = 0;
      this.velocityZ = 0;
    }
  }

  applySlopePhysics() {
    if (!this.isGrounded()) return;
    const kicker = this.getKickerAt(this.position, this.positionZ);

    const kickerAngle = kicker ? getKickerAngle(kicker) : 0;

    const gravityForceMagnitude = gravity * this.weight;
    const gravityForceSlopeComponent = new Vector(
      0,
      Math.sin(slopeAngle - kickerAngle) * gravityForceMagnitude
    );
    this.forces.push(gravityForceSlopeComponent);
  }

  applyBoardPhysics() {
    if (!this.isGrounded()) return;

    const edgeFrictionFactor = 1.8;

    const edgeForceMagnitude =
      this.velocity.clone().cross(this.boardDirection) * edgeFrictionFactor;

    const edgeForce = this.boardDirection
      .clone()
      .rotate(Math.PI / 2)
      .scale(edgeForceMagnitude);

    this.forces.push(edgeForce);
  }

  applyAirFriction() {
    const airFrictionFactor = 0.0000005;
    const forceMagnitude = -airFrictionFactor * this.velocity.length ** 2;
    const force = this.velocity.clone().scale(forceMagnitude);
    this.forces.push(force);
  }

  handleKickers(dt) {
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
      this.boardDirection.set(0, -1);
      this.velocity.alignWith(this.boardDirection);
      this.angularVelocity = 0;
      this.bodyAngle = 0;
      return;
    }

    const jumpedKicker = !currentKicker && previousKicker;
    if (jumpedKicker) {
      const kickerAngle = getKickerAngle(previousKicker);

      const slopeVelocity = this.velocity.length;
      this.velocity.toLength(Math.cos(kickerAngle) * slopeVelocity);
      this.positionZ = getKickerHeightAt(previousKicker, this.previousPosition);
      this.velocityZ = Math.sin(kickerAngle) * slopeVelocity;
      this.angularVelocity = this.boardDirection.angle - this.lastBoardAngle;
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
    const [nose, tail] = this.getBoardTipPositions();

    [...Array(3)].forEach(() => {
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

  paint.rect({
    position: new Vector(0, canvas.height / 2),
    width: canvas.width,
    height: 50,
    fill: 'lightblue'
  });

  player.renderShadow();
  kickers.forEach(kicker => renderKickerShadow(kicker, paint));

  kickers.forEach(kicker => renderKicker(kicker, paint));
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
