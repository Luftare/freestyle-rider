import Vector from 'vector';
import Paint from 'paint';
import Loop from 'loop';
import GameInput from './GameInput';

function metersToPixels(meters) {
  return meters * 40;
}

const canvas = document.querySelector('canvas');
const paint = new Paint(canvas);
const gameInput = new GameInput(canvas);
const slopeAngle = 15 * (Math.PI / 180);
const gravity = metersToPixels(-9.81);

class Player {
  constructor() {
    this.position = new Vector(canvas.width / 2, 100);
    this.velocity = new Vector(0, -100);
    this.boardDirection = new Vector(0, -1);
    this.boardLength = metersToPixels(1.6);
    this.boardWidth = metersToPixels(0.4);
    this.weight = 1;
    this.forces = [];
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
    this.applySlopePhysics(dt);
    this.applyAirFriction(dt);
    this.applyForces(dt);
    if (this.position.y < 0) this.position.y = canvas.height;
  }

  handleInput(dt) {
    const { ArrowLeft, ArrowRight } = gameInput.keysDown;
    const rotation = 2 * dt;

    if (ArrowLeft) {
      this.boardDirection.rotate(-rotation);
    }

    if (ArrowRight) {
      this.boardDirection.rotate(rotation);
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

  applyAirFriction() {
    const airFrictionFactor = 0.000001;
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
  }

  renderBoard() {
    paint.path({
      points: this.getBoardTipPositions(),
      stroke: 'black',
      lineCap: 'round',
      lineWidth: this.boardWidth
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
    player.render();
  }
});
