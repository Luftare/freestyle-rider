import { debounce } from 'lodash';
import Vector from 'vector';
import Paint from 'paint';
import Loop from 'loop';
import GameInput from './GameInput';
import { renderKicker, renderKickerShadow } from './Kicker';
import { renderRail, renderRailShadow } from './Rail';
import { renderTable, renderTableShadow } from './Table';
import { renderSlopes, getSlopeAt } from './Slope';
import { showMessage } from './Graphics';
import gameLevel from './gameLevel';
import audio from './audio';
import Player from './Player';
import Fx from './Fx';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const slowdownButton = document.getElementById('slowdown');
const paint = new Paint(canvas);

const TIME_FACTOR_NORMAL = 1;
const TIME_FACTOR_SLOW = 0.5;

const gameContext = {
  playerStance: -1, //-1 = goofy, 1 = regular
  player: null,
  particles: [],
  timeFactor: TIME_FACTOR_NORMAL,
  input: new GameInput(canvas),
  fx: new Fx(canvas),
};

audio.init();

document
  .getElementById('stance-option--goofy')
  .addEventListener('change', e => {
    gameContext.playerStance = -1;
  });

document
  .getElementById('stance-option--regular')
  .addEventListener('change', e => {
    gameContext.playerStance = 1;
  });

const handleEnterKey = e => {
  if (e.key === 'Enter') {
    startGame();
    window.removeEventListener('keydown', handleEnterKey);
  }
};

const isTouchDevice = 'ontouchstart' in window;

const startGameButton = document.getElementById('start-game');
startGameButton.addEventListener(
  'click',
  isTouchDevice ? displayGuide : startGame
);
startGameButton.addEventListener(
  'touchstart',
  isTouchDevice ? displayGuide : startGame
);
window.addEventListener('keydown', handleEnterKey);

document.getElementById('guide').addEventListener('mousedown', startGame);
document.getElementById('guide').addEventListener('touchstart', startGame);

export function setSlowDown(activate) {
  gameContext.timeFactor = activate ? TIME_FACTOR_SLOW : TIME_FACTOR_NORMAL;
  const methodName = activate ? 'add' : 'remove';
  slowdownButton.classList[methodName]('button--active');
}

function toggleSlowdown(e) {
  e.preventDefault();
  e.stopPropagation();
  const shouldActivate = gameContext.timeFactor === TIME_FACTOR_NORMAL;
  setSlowDown(shouldActivate);
}

slowdownButton.addEventListener('touchstart', toggleSlowdown);
slowdownButton.addEventListener('mousedown', toggleSlowdown);

window.addEventListener('keydown', ({ key }) => {
  if (key.toLowerCase() === 's') {
    setSlowDown(gameContext.timeFactor === TIME_FACTOR_NORMAL);
  }
});

function displayGuide() {
  document.getElementById('welcome-view').style.display = 'none';
  document.getElementById('guide').style.display = 'grid';
}

function startGame() {
  document.getElementById('slowdown').hidden = false;
  document.getElementById('guide').style.display = 'none';
  document.getElementById('welcome-view').style.display = 'none';
  fitGameToScreen();
  window.addEventListener('resize', debounce(fitGameToScreen, 500));
  gameContext.player = new Player(gameContext.playerStance);
  render();
  showMessage('Break a leg!', '#42f59b');
  setTimeout(() => {
    audio.startAmbientSounds();
    gameLoop.start();
  }, 1000);
}

function fitGameToScreen() {
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function update(dt) {
  gameContext.player.update(dt, gameContext);
  gameContext.particles.forEach(particle => particle.update(dt));
  gameContext.particles = gameContext.particles.filter(
    particle => particle.life > 0
  );

  gameContext.input.clearState();
}

function render() {
  canvas.width = canvas.width;
  gameContext.fx.update(0.0016);
  ctx.translate(
    canvas.width / 2,
    -gameContext.player.position.y + canvas.height / 1.3
  );

  renderSlopes(gameLevel.slopes, paint);

  paint.rect({
    position: new Vector(0, canvas.height / 2),
    width: canvas.width,
    height: 50,
    fill: 'lightblue',
  });

  gameContext.player.renderShadow(paint);
  gameLevel.kickers.forEach(kicker => renderKickerShadow(kicker, paint));
  gameLevel.rails.forEach(rail => renderRailShadow(rail, paint));
  gameLevel.tables.forEach(table => renderTableShadow(table, paint));

  gameLevel.kickers.forEach(kicker => {
    const slope = getSlopeAt(
      { y: kicker.position.y + kicker.length },
      gameLevel.slopes
    );
    renderKicker(kicker, slope.angle, paint);
  });
  gameLevel.rails.forEach(rail => renderRail(rail, paint));
  gameLevel.tables.forEach(table => renderTable(table, paint));
  gameContext.particles.forEach(particle => particle.render(paint));
  gameContext.player.render(paint);
}

const gameLoop = new Loop({
  animationFrame: true,
  onTick: dtInMs => {
    const dtInSeconds = Math.min(0.1, (gameContext.timeFactor * dtInMs) / 1000);
    update(dtInSeconds);
    render();
  },
});
