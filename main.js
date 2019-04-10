import Vector from 'vector';
import Paint from 'paint';
import Loop from 'loop';
import GameInput from './GameInput';

let renderScale = 40;

function metersToPixels(meters) {
  return meters * renderScale;
}

function pixelsToMeters(pixels) {
  return pixels / renderScale;
}

function getShadowPosition({ x, y }, z) {
  return new Vector(x, y).addX(z).addY(z * 0.5);
}

const canvas = document.querySelector('canvas');
const paint = new Paint(canvas);
const gameInput = new GameInput(canvas);
const slopeAngle = 20 * (Math.PI / 180);
const gravity = metersToPixels(-9.81);
const SHADOW_COLOR = 'grey';

class Player {
  constructor() {
    this.position = new Vector(canvas.width / 2, 100);
    this.positionZ = metersToPixels(2);
    this.velocity = new Vector(0, -100);
    this.velocityZ = 0;
    this.boardDirection = new Vector(0, -1);
    this.boardLength = metersToPixels(1.6);
    this.boardWidth = metersToPixels(0.4);
    this.bodyAngle = 0;
    this.maxBodyAngle = Math.PI * 0.3;
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
    console.log(pixelsToMeters(this.positionZ));
    this.handleInput(dt);
    this.applyGravity(dt);
    this.applySlopePhysics(dt);
    this.applyBoardPhysics(dt);
    this.applyAirFriction(dt);
    this.applyForces(dt);
    if (this.position.y < 0) this.position.y = canvas.height;
  }

  handleInput(dt) {
    const { ArrowLeft, ArrowRight } = gameInput.keysDown;
    const spaceKey = gameInput.keysDownOnce[' '];
    const rotation = 5 * dt;

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

    if (shouldRotateBoard) {
      const boardRotateAngle = 3 * this.bodyAngle * dt;
      this.boardDirection.rotate(boardRotateAngle);
    } else {
      this.bodyAngle *= 0.85;
    }

    const shouldJump = spaceKey && this.isGrounded();

    if (shouldJump) {
      this.velocityZ = metersToPixels(4);
      this.positionZ += 0.1;
    }
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
    const gravityForceMagnitude = gravity * this.weight;
    const gravityForceSlopeComponent = new Vector(
      0,
      Math.sin(slopeAngle) * gravityForceMagnitude
    );
    this.forces.push(gravityForceSlopeComponent);
  }

  applyBoardPhysics() {
    const edgeFrictionFactor = 1.5;

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

  applyForces(dt) {
    const totalForce = this.forces.reduce(
      (acc, force) => acc.add(force),
      new Vector()
    );

    const acceleration = totalForce.scale(1 / this.weight);
    this.velocity.scaledAdd(dt, acceleration);
    this.position.scaledAdd(dt, this.velocity);
    this.forces = [];
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

new Loop({
  animationFrame: true,
  autoStart: true,
  onTick: dtInMs => {
    const dtInSeconds = dtInMs / 1000;

    player.update(dtInSeconds);
    gameInput.clearState();

    canvas.width = canvas.width;
    player.renderShadow();
    player.render();
  }
});
