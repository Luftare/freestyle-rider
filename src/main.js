import { debounce } from 'lodash';
import Vector from 'vector';
import Paint from 'paint';
import Loop from 'loop';
import GameInput from './GameInput';
import { renderKicker, renderKickerShadow } from './Kicker';
import { renderRail, renderRailShadow } from './Rail';
import { renderTable, renderTableShadow } from './Table';
import { renderSlopes, getSlopeAt } from './Slope';
import gameLevel from './gameLevel';
import audio from './audio';
import Player from './Player';
import Fx from './Fx';

audio.init();

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const paint = new Paint(canvas);

let playerStance = -1;

document.getElementById('stance-option--goofy').addEventListener('change', (e) => {
  playerStance = -1;
})
document.getElementById('stance-option--regular').addEventListener('change', (e) => {
  playerStance = 1;
})

const handleEnterKey = e => {
  if (e.key === 'Enter') {
    startGame();
  }
};

const startGameButton = document.getElementById('start-game');
startGameButton.addEventListener('click', startGame);
startGameButton.addEventListener('touchstart', startGame);
window.addEventListener('keydown', handleEnterKey);

function startGame() {
  window.removeEventListener('keydown', handleEnterKey);
  document.getElementById('welcome-view').style.display = 'none';
  fitGameToScreen();
  window.addEventListener('resize', debounce(fitGameToScreen, 500));
  gameContext.player = new Player(playerStance);
  gameLoop.start();
}

function fitGameToScreen() {
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const gameContext = {
  player: null,
  particles: [],
  input: new GameInput(canvas),
  fx: new Fx(canvas),
};

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
  ctx.translate(canvas.width / 2, -gameContext.player.position.y + canvas.height / 1.3);

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
    const dtInSeconds = Math.min(0.1, dtInMs / 1000);
    update(dtInSeconds);
    render();
  },
});
